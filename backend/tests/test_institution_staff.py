from test_flows import client,headers

def test_institution_membership_and_classes_never_grant_student_access(client):
    school=client.get('/schools',headers=headers('P')).json()[0]
    room=client.get('/classrooms',headers=headers('P')).json()[0]
    sid,cid=school['id'],room['id']
    def school_staff(actor,body,key):return client.post('/schools/'+sid+'/staff',json=body,headers=headers(actor,key))
    assert school_staff('Q',{'adult_id':'test-Q'},'self-add').status_code==404
    assert school_staff('P',{'adult_id':'test-Q','role':'teacher'},'add').status_code==200
    assert sid in [s['id'] for s in client.get('/schools',headers=headers('Q')).json()]
    assert cid not in [c['id'] for c in client.get('/classrooms',headers=headers('Q')).json()]
    result=client.post('/classrooms/'+cid+'/staff',json={'adult_id':'test-Q'},headers=headers('P','class-staff'))
    assert result.status_code==200,result.text
    assert cid in [c['id'] for c in client.get('/classrooms',headers=headers('Q')).json()]
    context=client.get('/teaching/context?school_id='+sid+'&classroom_id='+cid,headers=headers('Q'))
    assert context.status_code==200 and context.json()['students']==[]
    assert client.get('/students/synthetic-lia',headers=headers('Q')).status_code==404
    assert client.get('/classrooms/'+cid+'/report',headers=headers('Q')).json()['totals']['students']==0
    # The student's manager explicitly grants Q access independently of the institution.
    invitation=client.post('/students/synthetic-lia/invitations',json={'recipient_id':'test-Q','role':'teacher'},headers=headers('A','invite-q')).json()
    accepted=client.post('/invitations/accept',json={'token':invitation['token']},headers=headers('Q','accept-q'))
    assert accepted.status_code==200,accepted.text
    assert len(client.get('/teaching/context?school_id='+sid+'&classroom_id='+cid,headers=headers('Q')).json()['students'])==1
    assert school_staff('Q',{'adult_id':'test-P','role':'manager'},'elevate').status_code==404
    assert school_staff('P',{'adult_id':'test-Q','role':'teacher','active':False},'revoke').status_code==200
    assert client.get('/classrooms/'+cid+'/report',headers=headers('Q')).status_code==404
    assert cid not in [c['id'] for c in client.get('/classrooms',headers=headers('Q')).json()]
    # Revoking school membership does not silently revoke an independently granted personal link.
    assert client.get('/students/synthetic-lia',headers=headers('Q')).status_code==200
    assert school_staff('P',{'adult_id':'test-Q'},'restore').status_code==200
    assert cid not in [c['id'] for c in client.get('/classrooms',headers=headers('Q')).json()]

def test_manager_role_is_explicit_and_cannot_promote_others(client):
    school=client.get('/schools',headers=headers('P')).json()[0];sid=school['id']
    assert client.post('/schools/'+sid+'/staff',json={'adult_id':'test-Q','role':'manager'},headers=headers('P','manager')).status_code==200
    assert client.get('/schools/'+sid+'/staff',headers=headers('Q')).status_code==200
    assert client.post('/classrooms',json={'school_id':sid,'name':'Turma colaborativa'},headers=headers('Q','room')).status_code==200
    assert client.post('/schools/'+sid+'/staff',json={'adult_id':'test-P','role':'manager'},headers=headers('Q','owner-change')).status_code==422
    assert client.get('/schools/'+sid+'/staff',headers=headers('A')).status_code==404
