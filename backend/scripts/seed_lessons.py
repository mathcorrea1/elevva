"""Add-only reusable lessons. Fictional technical fixtures, never approved curriculum."""
from sqlalchemy import select
from app.features import models as m
from app.features.lessons.contracts import LessonCommand
from app.features.lessons.service import body_for
from app.features.trails.service import snapshot, enroll

def seed_lessons(db,actors,students,identify,stamp,put):
    def q(key,kind,prompt,answer,options=None,**extra):
        return {'id':key,'kind':kind,'prompt':prompt,'answer':answer,'options':options or [],'skill':'Formação e reconhecimento de palavras · teste técnico',
                'hint':'Observe os elementos e use o tempo que precisar.','feedback_correct':'Boa descoberta! Vamos continuar.','feedback_incorrect':'A resposta foi registrada. Você pode observar outra possibilidade.',**extra}
    options=[{'id':'ca','text':'CA'},{'id':'sa','text':'SA'}]
    questions=[q('escolha','single','Qual palavra está escrita como CASA?','casa',[{'id':'casa','text':'CASA'},{'id':'bola','text':'BOLA'},{'id':'lua','text':'LUA'}]),
      q('varias','multiple','Selecione as duas partes usadas em CASA.',['ca','sa'],options+[{'id':'bo','text':'BO'}]),
      q('montar','order','Junte as partes para formar CASA.',['ca','sa'],options),
      q('pares','matching','Associe cada palavra à mesma palavra.',{'casa':'casa-par','bola':'bola-par'},[{'id':'casa','text':'CASA'},{'id':'bola','text':'BOLA'}],targets=[{'id':'casa-par','text':'CASA'},{'id':'bola-par','text':'BOLA'}]),
      q('escrever','text','Escreva a palavra CASA.',['casa'],normalization={'ignore_case':True,'ignore_accents':False,'collapse_spaces':True,'unmatched':'human_review'})]
    screens=[{'id':'boas-vindas','type':'text_image','title':'Pequenas partes, novas palavras','text':'Vamos observar, montar e escrever uma palavra. Uma descoberta por vez.','image':{'builtin':'sprout','alt':'Um broto azul e dourado representa uma nova descoberta.'}},
      {'id':'observar','type':'text','title':'Vamos observar juntos','text':'Na palavra CASA, podemos observar as partes CA e SA. Estes são exemplos sintéticos para testar o aplicativo, ainda sem revisão pedagógica.'}]
    screens += [{'id':'tela-'+question['id'],'type':'activity','title':title,'question':question} for title,question in zip(['Uma palavra conhecida','Escolhas que combinam','Vamos montar?','Cada palavra tem seu par','Agora é sua vez'],questions)]
    screens += [{'id':'conclusao','type':'completion','title':'Cada descoberta importa!','text':'Suas respostas serão salvas. O professor pode acompanhar as tentativas e ajudar no próximo passo.','image':{'builtin':'lumi','alt':''}}]
    commands=[('palavras','P',{'title':'Oficina de palavras · demonstração','description':'Oito telas com cinco mecânicas para revisão técnica. Conteúdo não validado pedagogicamente.','objective':'Testar seleção, montagem, associação e escrita, com salvamento e revisão humana.','skills':['Formação e reconhecimento de palavras · teste técnico'],'cover':{'builtin':'butterfly','alt':''},'screens':screens}),
      ('encontro','Q',{'title':'Um encontro com as letras · demonstração','description':'Uma aula reutilizável criada na conta Q, sem validação pedagógica.','objective':'Verificar escolhas e compartilhar conteúdo sem compartilhar dados pessoais.','cover':{'builtin':'boat','alt':''},'screens':[{'id':'intro','type':'text','title':'Vamos conhecer a letra A?','text':'Observe as formas e escolha no seu ritmo.'},{'id':'achar','type':'activity','title':'Uma letra para encontrar','question':q('a','single','Encontre a letra A.','a',[{'id':'a','text':'A'},{'id':'b','text':'B'}])},{'id':'fim','type':'completion','title':'Descoberta registrada'}]})]
    rows=[];revisions=[]
    for key,author,data in commands:
        cmd=LessonCommand.model_validate(data);body=body_for(cmd)
        row=put(m.Content,'screens-lesson:'+key,author_id=actors[author],kind='lesson',title=cmd.title,status='synthetic',body=body,version=1)
        revision=put(m.ContentRevision,'screens-revision:'+key,content_id=row.id,version=1,captured_by=actors[author],publication_status='synthetic',snapshot={'kind':'lesson','title':row.title,'body':row.body})
        rows.append(row);revisions.append(revision)
    draft=put(m.Content,'screens-draft',author_id=actors['P'],kind='lesson',title='Minha próxima descoberta · rascunho',status='draft',version=1,body={'description':'Ideia ainda em preparação.','objective':'','difficulty':'not_defined','skills':[],'audience':'','adaptations':'','cover':{'builtin':'sky','alt':''},'screens':[],'items':[],'instructions':'','activity_kinds':[],'visibility':'private','require_review_for_advance':False})
    put(m.ContentRevision,'screens-draft-revision',content_id=draft.id,version=1,captured_by=actors['P'],publication_status='draft',snapshot={'kind':'lesson','title':draft.title,'body':draft.body})
    for i,(author,recipient,status) in enumerate([('P','Q','accepted'),('Q','P','pending')]):
        put(m.ContentShare,'screens-share:'+author,content_id=rows[i].id,revision_id=revisions[i].id,created_by=actors[author],recipient_id=actors[recipient],can_copy=True,can_redistribute=False,status=status,created_at=stamp(-1))
    for i,keys in [(0,['lia','theo']),(1,['caio','bia'])]:
        lesson={'key':'oficina','title':rows[i].title,'objective':rows[i].body['objective'],'image':rows[i].body['cover'],'instructions':'Explore cada tela e confirme suas respostas.','concise_instructions':'Observe. Experimente. Continue.','advance_percent':None,'lesson_revision_id':revisions[i].id,'contents':[]}
        definition=put(m.TrailDefinition,'screens-trail:'+str(i),author_id=rows[i].author_id,title='Oficina de descobertas' if i==0 else 'Navegando pelas letras',description='Aulas com telas sequenciais. Demonstração técnica sem aprovação pedagógica.',status='synthetic',version=1,body={'cover':{'builtin':'garden' if i==0 else 'sky','alt':''},'scenario':'garden' if i==0 else 'sky','availability':'sequential','lessons':[lesson]})
        put(m.TrailRevision,'screens-trail-revision:'+str(i),trail_id=definition.id,version=1,snapshot=snapshot(definition))
        for key in keys:enroll(db,students[key].id,definition,db.get(m.Adult,rows[i].author_id))
    db.flush();return [r.id for r in rows]+[draft.id]
