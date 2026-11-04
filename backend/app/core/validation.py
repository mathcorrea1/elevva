"""User-facing validation messages; never echo submitted values."""
LABELS={'title':'Título','name':'Nome','display_name':'Nome','description':'Descrição','objective':'Objetivo','prompt':'Enunciado','text':'Texto',
    'birth_date':'Nascimento','supports':'Apoios','skills':'Habilidades','skill':'Habilidade','transcript':'Alternativa textual do vídeo',
    'video_id':'Identificador do vídeo','image':'Imagem','answer':'Resposta correta','max_attempts':'Limite de tentativas','q':'Busca','search':'Busca',
    'feedback_correct':'Feedback de acerto','feedback_incorrect':'Feedback de outra resposta','instruction':'Instrução','instructions':'Instrução',
    'version':'Versão','question':'Atividade','normalization':'Normalização','visibility':'Visibilidade','screens':'Telas','options':'Alternativas','targets':'Pares'}

def describe(error):
    loc=list(error.get('loc',()));labels=[];i=0
    while i<len(loc):
        part=loc[i]
        if part in ('body','query','path'):i+=1;continue
        if part in ('screens','options','targets') and i+1<len(loc) and isinstance(loc[i+1],int):
            labels.append({'screens':'Tela','options':'Alternativa','targets':'Par'}[part]+' '+str(loc[i+1]+1));i+=2;continue
        if isinstance(part,str):labels.append(LABELS.get(part,'Campo'))
        i+=1
    kind=error.get('type');ctx=error.get('ctx') or {};message=error.get('msg','Verifique o preenchimento.')
    if kind=='value_error':message=message.removeprefix('Value error, ')
    elif kind=='string_too_short':message='Preencha com pelo menos '+str(ctx.get('min_length',1))+' caracteres.'
    elif kind=='string_too_long':message='Use até '+str(ctx.get('max_length','o limite indicado'))+' caracteres.'
    elif kind=='too_short':message='Inclua pelo menos '+str(ctx.get('min_length',1))+' elemento(s).'
    elif kind=='too_long':message='Use até '+str(ctx.get('max_length','o limite indicado'))+' elemento(s).'
    elif kind=='missing':message='Preencha este campo.'
    elif kind in ('int_parsing','int_type','int_from_float'):message='Informe um número inteiro.'
    elif kind=='literal_error':message='Escolha uma das opções disponíveis.'
    elif kind=='extra_forbidden':message='Campo não reconhecido nesta versão. Atualize a página antes de salvar.'
    else:message='Verifique o formato e os limites informados.'
    return (' · '.join(labels)+': ' if labels else '')+message
