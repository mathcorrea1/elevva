"""Add-only curriculum-neutral course demos. Preserve all previous assignment/attempt identities."""
import uuid
from sqlalchemy import select,func
from app.features import models as m
from app.features.trails.service import snapshot,enroll

def seed_trails(db,actors,students,activities,identify,stamp,put):
    def lesson(key,title,image,indices,skill):
        contents=[]
        for index in indices:
            content=activities[index]
            # Annotate only seed-owned snapshots; no review or pedagogical approval is fabricated.
            body={**content.body,'items':[{**i,'skill':i.get('skill') or skill,'required':i.get('required',True)} for i in content.body['items']]}
            contents.append({'id':content.id,'version':content.version,'title':content.title,**body})
        return {'key':key,'title':title,'objective':'Demonstração técnica: explorar escolhas e registrar respostas, com apoio do adulto. Conteúdo e ordem aguardam revisão pedagógica.',
                'image':{'builtin':image,'alt':''},'instructions':'Escolha uma opção por pergunta e confirme para salvar. Você pode pausar e retomar.',
                'concise_instructions':'Escolha. Confirme. Continue no seu ritmo.','advance_percent':None,'contents':contents}
    garden_lessons=[lesson('brotos','Primeiros brotos','sprout',[0,1],'Reconhecimento de símbolos · demo'),
        lesson('asas','Asas para descobrir','butterfly',[2,3],'Exploração de palavras · demo'),
        lesson('encontros','Pequenos encontros','boat',[4,5],'Identificação visual · demo'),
        lesson('historias','Folhas de histórias','milestone',[0],'Reconhecimento de símbolos · demo'),
        lesson('jardim','Um jardim de conquistas','lumi',[2],'Exploração de palavras · demo')]
    sky_lessons=[lesson('barco','Partiu, barquinho!','boat',[2,0],'Exploração de palavras · demo'),
        lesson('nuvens','Nuvens de descobertas','butterfly',[4],'Identificação visual · demo'),
        lesson('estrela','Uma estrela para contar','sprout',[5],'Identificação visual · demo')]
    definitions=[]
    for key,title,theme,lessons,author in [('garden','Jardim das Descobertas','garden',garden_lessons,'P'),('sky','Céu das Histórias','sky',sky_lessons,'Q')]:
        row=put(m.TrailDefinition,'course:'+key,author_id=actors[author],title=title,description='Um cenário de demonstração para explorar aulas e observar cada descoberta. Não é currículo pedagógico validado.',body={'cover':{'builtin':theme,'alt':''},'scenario':theme,'availability':'sequential','lessons':lessons},status='synthetic',version=1,created_at=stamp(-30))
        put(m.TrailRevision,'course-revision:'+key,trail_id=row.id,version=1,snapshot=snapshot(row),created_at=stamp(-30))
        definitions.append(row)
    # Link only legacy rows created by this same seed, never arbitrary user-created stages.
    for student_key,definition,author in [('lia',definitions[0],'A'),('caio',definitions[1],'B')]:
        student=students[student_key]
        enrollment=put(m.TrailEnrollment,'course-enrollment:'+student_key,student_id=student.id,trail_id=definition.id,trail_version=1,snapshot=snapshot(definition),created_by=actors[author],created_at=stamp(-29))
        position=db.scalar(select(func.max(m.Assignment.position)).where(m.Assignment.student_id==student.id)) or 0
        for index,l in enumerate(definition.body['lessons']):
            legacy_id=identify(f'stage:{student_key}:{index}')
            existing=db.get(m.LearningStage,legacy_id)
            if existing and (existing.enrollment_id is None or existing.enrollment_id==enrollment.id):
                if existing.enrollment_id is None:
                    existing.enrollment_id=enrollment.id
                    existing.lesson_snapshot={k:v for k,v in l.items() if k!='contents'}
                    # Names describe the seed's new hierarchy; preserve any later edits on rerun.
                    existing.title=l['title'];existing.description=l['objective']
                continue
            stage=put(m.LearningStage,f'course-stage:{student_key}:{index}',student_id=student.id,title=l['title'],description=l['objective'],created_by=actors[author],enrollment_id=enrollment.id,lesson_snapshot={k:v for k,v in l.items() if k!='contents'},created_at=stamp(-29))
            for offset,content in enumerate(l['contents']):
                if db.get(m.Assignment,identify(f'course-task:{student_key}:{index}:{offset}')):continue
                position+=1
                put(m.Assignment,f'course-task:{student_key}:{index}:{offset}',student_id=student.id,stage_id=stage.id,content_id=content['id'],content_version=content['version'],snapshot={**content,'advance_percent':None},position=position,created_by=actors[author],completed_at=None)
    # A new, explicitly synthetic instrument provides comparable items without rewriting old snapshots.
    lab_content=put(m.Content,'course-comparable-content',author_id=actors['P'],kind='activity',title='Escolhas comparáveis · demonstração técnica',status='synthetic',version=1,
        body={'instructions':'Exemplo sintético: leia a palavra apresentada e escolha a opção correspondente. Conteúdo não validado pedagogicamente.',
        'items':[{'id':'demo-bola','prompt':'Encontre BOLA.','choices':['BOLA','MALA','CASA'],'answer':0,'required':True,'reading_allowed':False,'skill':'Localizar palavra apresentada · demo'},
                 {'id':'demo-lua','prompt':'Encontre LUA.','choices':['SOL','LUA','RUA'],'answer':1,'required':True,'reading_allowed':False,'skill':'Localizar palavra apresentada · demo'},
                 {'id':'demo-gato','prompt':'Encontre GATO.','choices':['PATO','DADO','GATO'],'answer':2,'required':True,'reading_allowed':False,'skill':'Localizar palavra apresentada · demo'}]})
    lab_lesson={'key':'comparar','title':'Palavras por perto','objective':'Registrar escolhas em itens equivalentes para testar a investigação do professor. Demonstração técnica sem rubrica validada.',
        'image':{'builtin':'butterfly','alt':''},'instructions':lab_content.body['instructions'],'concise_instructions':'Leia. Escolha. Confirme.','advance_percent':None,
        'contents':[{'id':lab_content.id,'version':1,'title':lab_content.title,**lab_content.body}]}
    lab=put(m.TrailDefinition,'course:lab',author_id=actors['P'],title='Palavras por perto · demo',description='Um laboratório sintético para comparar itens equivalentes e investigar os registros. Sem classificação pedagógica.',body={'cover':{'builtin':'sky','alt':''},'scenario':'sky','availability':'sequential','lessons':[lab_lesson]},status='synthetic',version=1,created_at=stamp(-5))
    put(m.TrailRevision,'course-revision:lab',trail_id=lab.id,version=1,snapshot=snapshot(lab),created_at=stamp(-5))
    definitions.append(lab)
    for key,answers in [('lia',[0,1,0]),('theo',[1,0,2])]:
        actor=db.get(m.Adult,actors['P'])
        enrollment=enroll(db,students[key].id,lab,actor)
        stage=db.scalar(select(m.LearningStage).where(m.LearningStage.enrollment_id==enrollment.id))
        assignment=db.scalar(select(m.Assignment).where(m.Assignment.stage_id==stage.id))
        attempt_id=identify('course-lab-attempt:'+key)
        if not db.get(m.Attempt,attempt_id):
            response={item['id']:choice for item,choice in zip(lab_content.body['items'],answers)}
            put(m.Attempt,'course-lab-attempt:'+key,assignment_id=assignment.id,student_id=students[key].id,adult_id=actors['P'],responses=response,status='finished',version=5,created_at=stamp(-2),finished_at=stamp(-2,1),supports_used=['large_text'])
            assignment.completed_at=stamp(-2,1)
        put(m.Observation,'course-observation:'+key,student_id=students[key].id,adult_id=actors['P'],context='Observação sintética para investigação',text='Exemplo fictício: o adulto registrou necessidade de retomar uma escolha, sem inferir causa ou diagnóstico.',details={'skill':'Localizar palavra apresentada · demo','support':'Texto ampliado informado na aplicação','needs_support':key=='theo'},created_at=stamp(-1))
    if not db.get(m.StudentCare,students['lia'].id):
        db.add(m.StudentCare(student_id=students['lia'].id,communication='Exemplo fictício: usa fala e aponta escolhas; prefere instruções curtas.',sensitive_notes='Registro sintético restrito para testar concessão explícita. Não corresponde a diagnóstico ou criança real.',presentation={'instruction_mode':'concise','prefer_linear':False,'font_scale':1},author_id=actors['A'],version=1,updated_at=stamp(-3)))
    db.flush()
    return [r.id for r in definitions]
