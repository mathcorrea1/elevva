from test_flows import client, headers
from test_trail_catalog import course

def test_bulk_trail_assignments_are_atomic_deduplicated_and_keep_individual_grants(client):
    trail=client.post('/trails',json=course(),headers=headers('P','course')).json()
    room=client.get('/classrooms',headers=headers('P')).json()[0]
    path='/trails/'+trail['id']+'/assign'
    body={'version':1,'student_ids':['synthetic-lia'],'classroom_ids':[room['id']]}
    result=client.post(path,json=body,headers=headers('P','bulk'))
    assert result.status_code==200,result.text
    assert result.json()['assigned']==1
    repeated=client.post(path,json=body,headers=headers('P','bulk')).json()
    again=client.post(path,json=body,headers=headers('P','other-key')).json()
    assert repeated==result.json() and again['enrollment_ids']==result.json()['enrollment_ids']
    assert len(client.get('/students/synthetic-lia/trails',headers=headers()).json())==1
    assert client.post(path,json=body,headers=headers('A','guardian')).status_code==403
    assert client.post(path,json=body,headers=headers('Q','foreign-room')).status_code==404
    new=client.post('/students',json={'name':'Novo sintético'},headers=headers('P','new')).json()
    denied=client.post(path,json={'version':1,'student_ids':[new['id'],'synthetic-caio']},headers=headers('P','invalid-group'))
    assert denied.status_code==404
    assert client.get('/students/'+new['id']+'/trails',headers=headers('P')).json()==[]
