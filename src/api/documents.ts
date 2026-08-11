import { getCurrentWorkspaceId, supabase } from "./client";
export type DocumentRecord={id:string;entity_type:string;entity_id:string;filename:string;storage_path:string;mime_type:string;byte_size:number;sharing_scope:"workspace"|"homeowner"|"contractor";created_at:string};
export async function listDocuments(){const {data,error}=await supabase.from("documents").select("id,entity_type,entity_id,filename,storage_path,mime_type,byte_size,sharing_scope,created_at").order("created_at",{ascending:false});if(error)throw error;return(data??[])as DocumentRecord[];}
export async function uploadDocument(input:{entityType:string;entityId:string;sharingScope:string;file:File}){
 if(input.file.size<=0||input.file.size>25*1024*1024)throw new Error("Documents must be between 1 byte and 25 MB.");
 const allowed=["application/pdf","image/jpeg","image/png","image/webp","text/plain","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
 if(!allowed.includes(input.file.type))throw new Error("This document type is not supported.");
 const workspace=await getCurrentWorkspaceId();const name=input.file.name.replace(/[^a-zA-Z0-9._-]/g,"_");const path=`${workspace}/${crypto.randomUUID()}-${name}`;
 const uploaded=await supabase.storage.from("hlc-documents").upload(path,input.file,{contentType:input.file.type,upsert:false});if(uploaded.error)throw uploaded.error;
 const {data,error}=await supabase.rpc("register_document",{p_entity_type:input.entityType,p_entity_id:input.entityId,p_filename:input.file.name,p_storage_path:path,p_mime_type:input.file.type,p_byte_size:input.file.size,p_sharing_scope:input.sharingScope});
 if(error){await supabase.storage.from("hlc-documents").remove([path]);throw error;}return data as string;
}
export async function getDocumentUrl(path:string){const{data,error}=await supabase.storage.from("hlc-documents").createSignedUrl(path,300);if(error)throw error;return data.signedUrl;}
