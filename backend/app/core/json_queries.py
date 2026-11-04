from sqlalchemy import func,cast,JSON

def values(db,column,name,text=False):
    if db.bind.dialect.name=='sqlite':return func.json_each(column).table_valued('key','value').alias(name)
    return (func.json_array_elements_text(column) if text else func.json_array_elements(column)).table_valued('value').lateral(name)

def key(db,value,name):
    return func.json_extract(value,'$.'+name) if db.bind.dialect.name=='sqlite' else cast(value,JSON)[name].as_string()
