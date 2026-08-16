import { getCurrentWorkspaceId, supabase } from "./client";

export type DocumentRecord={id:string;entity_type:string;entity_id:string;filename:string;storage_path:string;mime_type:string;byte_size:number;sharing_scope:"workspace"|"homeowner"|"contractor";created_at:string};

export const HLC_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
export const HLC_UPLOAD_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export async function listDocuments(){const {data,error}=await supabase.from("documents").select("id,entity_type,entity_id,filename,storage_path,mime_type,byte_size,sharing_scope,created_at").order("created_at",{ascending:false});if(error)throw error;return(data??[])as DocumentRecord[];}

export async function uploadDocument(input:{entityType:string;entityId:string;sharingScope:string;file:File}){
 if(input.file.size<=0||input.file.size>HLC_UPLOAD_MAX_BYTES)throw new Error("Files must be between 1 byte and 25 MB. Keep videos short so they stay below the upload limit.");
 if(!HLC_UPLOAD_ALLOWED_MIME_TYPES.includes(input.file.type as (typeof HLC_UPLOAD_ALLOWED_MIME_TYPES)[number]))throw new Error("Unsupported file type. Use PDF, Word, text, JPEG, PNG, WebP, MP4, MOV, or WebM.");
 const workspace=await getCurrentWorkspaceId();const name=input.file.name.replace(/[^a-zA-Z0-9._-]/g,"_");const path=`${workspace}/${crypto.randomUUID()}-${name}`;
 const uploaded=await supabase.storage.from("hlc-documents").upload(path,input.file,{contentType:input.file.type,upsert:false});if(uploaded.error)throw uploaded.error;
 const {data,error}=await supabase.rpc("register_document",{p_entity_type:input.entityType,p_entity_id:input.entityId,p_filename:input.file.name,p_storage_path:path,p_mime_type:input.file.type,p_byte_size:input.file.size,p_sharing_scope:input.sharingScope});
 if(error){await supabase.storage.from("hlc-documents").remove([path]);throw error;}return data as string;
}

export async function getDocumentUrl(documentId:string,path:string){
 const {error:auditError}=await supabase.rpc("record_document_view",{p_document_id:documentId});if(auditError)throw auditError;
 const{data,error}=await supabase.storage.from("hlc-documents").createSignedUrl(path,300);if(error)throw error;return data.signedUrl;
}
