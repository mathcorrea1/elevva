import React from 'react';
import {render,fireEvent,waitFor} from '@testing-library/react-native';
import {ExecuteScreen} from './ExecuteScreen';
import {ThemeProvider} from '@/shared/theme/ThemeProvider';
import {repository} from '@/shared/http/repository';
jest.mock('@react-native-async-storage/async-storage',()=>({getItem:jest.fn(async()=>null),setItem:jest.fn(async()=>{})}));
jest.mock('@react-navigation/native',()=>({useFocusEffect:(callback:()=>void)=>{const react=jest.requireActual('react');react.useEffect(callback,[callback]);}}));
jest.mock('react-native-safe-area-context',()=>({useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})}));
jest.mock('expo-speech',()=>({stop:jest.fn(async()=>{}),getAvailableVoicesAsync:jest.fn(async()=>[]),speak:jest.fn()}));
jest.mock('@/shared/http/repository',()=>({operationId:()=>String(Math.random()),repository:{get:jest.fn(),command:jest.fn()}}));

test('pause saves only confirmed choice; reopen resumes and permits editing before immutable submission',async()=>{
 let version=1;let responses:Record<string,number>={};let finished=false;
 const items=[{id:'i1',prompt:'Encontre A.',choices:['A','B'],reading_allowed:false},{id:'i2',prompt:'Encontre B.',choices:['A','B'],reading_allowed:false}];
 const snapshot=()=>({id:'attempt',version,responses:{...responses},items,instructions:'Escolha e confirme.',status:finished?'finished':'in_progress'});
 jest.mocked(repository.get).mockResolvedValue({presentation:{font_scale:1}});
 jest.mocked(repository.command).mockImplementation(async(path,body:any)=>{
  if(path.endsWith('/start'))return snapshot() as any;
  if(path.endsWith('/responses')){expect(body.version).toBe(version);responses={...responses,[body.item_id]:body.choice};version++;return snapshot() as any;}
  if(path.endsWith('/finish')){expect(body.version).toBe(version);finished=true;return {result:{correct:2,valid_items:2,total_items:2,required_items:2,required_answered:2,passed:true,advance_percent:null,note:'Exemplo técnico.'},feedback:{stage_completed:true,stage_title:'Aula de teste',new_achievements:[]}} as any;}
  throw new Error('Unexpected command');
 });
 const goBack=jest.fn();const props:any={route:{params:{student:{id:'s',name:'Estudante fictício'},assignment:{id:'task',title:'Atividade'}}},navigation:{goBack,setOptions:jest.fn(),replace:jest.fn()}};
 let view=render(<ThemeProvider><ExecuteScreen {...props}/></ThemeProvider>);
 await waitFor(()=>expect(view.getByText('Encontre A.')).toBeTruthy());
 fireEvent.press(view.getByRole('button',{name:'B. B'}));
 expect(responses).toEqual({});
 fireEvent.press(view.getByRole('button',{name:'Pausar aula'}));
 fireEvent.press(view.getByRole('button',{name:'Salvar seleção e pausar'}));
 await waitFor(()=>expect(goBack).toHaveBeenCalledTimes(1));expect(responses.i1).toBe(1);
 view.unmount();
 view=render(<ThemeProvider><ExecuteScreen {...props}/></ThemeProvider>);
 await waitFor(()=>expect(view.getByText('Encontre B.')).toBeTruthy());
 fireEvent.press(view.getByRole('button',{name:'Questão anterior'}));
 expect(view.getByRole('button',{name:'B. B'}).props.accessibilityState.selected).toBe(true);
 fireEvent.press(view.getByRole('button',{name:'A. A'}));fireEvent.press(view.getByRole('button',{name:'Confirmar e salvar resposta'}));
 await waitFor(()=>expect(view.getByText('Encontre B.')).toBeTruthy());expect(responses.i1).toBe(0);
 fireEvent.press(view.getByRole('button',{name:'B. B'}));fireEvent.press(view.getByRole('button',{name:'Confirmar e salvar resposta'}));
 await waitFor(()=>expect(view.getByRole('button',{name:'Entregar atividade'})).toBeTruthy());
 fireEvent.press(view.getByRole('button',{name:'Entregar atividade'}));
 await waitFor(()=>expect(view.getByText('2 acertos em 2 itens respondidos e corrigíveis')).toBeTruthy());expect(finished).toBe(true);
});
