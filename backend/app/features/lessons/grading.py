import unicodedata
from fastapi import HTTPException

def normalize(value,config):
    result=unicodedata.normalize('NFC',value.strip())
    if config.get('collapse_spaces',True):result=' '.join(result.split())
    if config.get('ignore_case',True):result=result.casefold()
    if config.get('ignore_accents',False):result=''.join(c for c in unicodedata.normalize('NFD',result) if not unicodedata.combining(c))
    return result

def validate_response(item,value):
    kind=item.get('kind','legacy')
    ids={o['id'] for o in item.get('options',[])}
    if kind=='legacy':ok=type(value) is int and 0<=value<len(item.get('choices',[]))
    elif kind=='single':ok=isinstance(value,str) and value in ids
    elif kind in ('multiple','order'):ok=isinstance(value,list) and all(isinstance(v,str) for v in value) and len(set(value))==len(value) and set(value)<=ids and (set(value)==ids if kind=='order' else bool(value))
    elif kind=='matching':ok=isinstance(value,dict) and set(value)==ids and all(isinstance(v,str) for v in value.values()) and len(set(value.values()))==len(value) and set(value.values())=={o['id'] for o in item['targets']}
    elif kind=='text':ok=isinstance(value,str) and 0<len(value.strip())<=200
    else:ok=False
    if not ok:raise HTTPException(422,'Resposta incompatível com os elementos desta atividade.')
    return value

def grade(item,value):
    if item.get('kind'):validate_response(item,value)
    kind=item.get('kind','legacy');pending=False
    if kind=='multiple':correct=set(value)==set(item['answer'])
    elif kind=='text':
        config=item.get('normalization',{});correct=normalize(value,config) in {normalize(a,config) for a in item['answer']}
        pending=not correct and config.get('unmatched','human_review')=='human_review'
    else:correct=value==item['answer']
    return {'correct':None if pending else correct,'needs_review':pending,'feedback':('Resposta salva para revisão do professor.' if pending else item.get('feedback_correct','Resposta registrada.') if correct else item.get('feedback_incorrect','Resposta registrada. Você pode rever os elementos.'))}

def result_for(item,value,interactions):
    outcome=grade(item,value)
    if outcome['needs_review']:
        for event in reversed(interactions):
            if event.get('kind')=='review' and event.get('item_id')==item['id'] and event.get('response')==value:
                return {'correct':event['correct'],'needs_review':False,'feedback':event.get('note','Revisão registrada.'),'review':{'author_id':event['adult_id'],'at':event['at'],'note':event.get('note')}}
    return outcome

def safe_item(item):
    return {k:v for k,v in item.items() if k not in ('answer','feedback_correct','feedback_incorrect')}

def response_label(item,value):
    if not item.get('kind'):return item['choices'][value]
    options={o['id']:o.get('text') or (o.get('image') or {}).get('alt') or 'Imagem' for o in item.get('options',[])}
    if isinstance(value,str):return options.get(value,value)
    if isinstance(value,list):return ' → '.join(options.get(v,v) for v in value)
    targets={o['id']:o.get('text') or (o.get('image') or {}).get('alt') or 'Imagem' for o in item.get('targets',[])}
    return '; '.join(options.get(k,k)+' ↔ '+targets.get(v,v) for k,v in value.items())

def comparison_result(item,attempt):
    value=attempt['responses'][item['id']]
    # Immediate authored feedback changes subsequent answers: compare first confirmed interaction.
    first=next((e for e in attempt.get('interactions',[]) if e.get('kind')=='answer' and e.get('item_id')==item['id']),None)
    if first:value=first['response']
    return value,result_for(item,value,attempt.get('interactions',[]))
