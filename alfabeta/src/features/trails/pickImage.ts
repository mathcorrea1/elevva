import {Platform} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
export async function pickImage():Promise<{base64:string;fileSize:number}|null>{
 if(Platform.OS==='web')return new Promise((resolve,reject)=>{
   const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.style.display='none';document.body.appendChild(input);
   input.addEventListener('cancel',()=>{input.remove();resolve(null);},{once:true});
   input.addEventListener('change',()=>{const file=input.files?.[0];input.remove();if(!file){resolve(null);return;}if(file.size>2*1024*1024){reject(new Error('Escolha uma imagem de até 2 MB.'));return;}const reader=new FileReader();reader.onerror=()=>reject(new Error('Não foi possível ler a imagem.'));reader.onload=()=>resolve({base64:String(reader.result).split(',')[1],fileSize:file.size});reader.readAsDataURL(file);},{once:true});input.click();
 });
 const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],base64:true,quality:0.8});if(result.canceled)return null;const asset=result.assets[0];if(!asset.base64)throw new Error('Não foi possível ler este arquivo.');return {base64:asset.base64,fileSize:asset.fileSize||0};
}
