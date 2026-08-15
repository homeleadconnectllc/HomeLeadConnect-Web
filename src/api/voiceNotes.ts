import { supabase } from "./client";

export type VoiceNote = { id:string; conversation_id:string; sender_user_id:string; storage_path:string; mime_type:string; byte_size:number; duration_seconds:number|null; created_at:string };

const VOICE_NOTE_BUCKET = "communication-voice-notes";

export async function listVoiceNotes(conversationId:string):Promise<VoiceNote[]> {
  const { data,error }=await supabase.from("voice_notes").select("id,conversation_id,sender_user_id,storage_path,mime_type,byte_size,duration_seconds,created_at").eq("conversation_id",conversationId).order("created_at");
  if(error) throw error; return (data??[]) as VoiceNote[];
}

export async function uploadVoiceNote(conversationId:string,workspaceId:string,file:File,durationSeconds?:number) {
  if(!file.type.startsWith("audio/")) throw new Error("Select an audio file.");
  if(file.size<=0 || file.size>15*1024*1024) throw new Error("Voice notes must be between 1 byte and 15 MB.");
  if(!workspaceId) throw new Error("This conversation has no workspace context.");
  const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
  const path=`${workspaceId}/${conversationId}/${crypto.randomUUID()}-${safeName}`;
  const uploaded=await supabase.storage.from(VOICE_NOTE_BUCKET).upload(path,file,{contentType:file.type,upsert:false});
  if(uploaded.error) throw uploaded.error;
  const { data,error }=await supabase.rpc("register_voice_note",{p_conversation_id:conversationId,p_storage_path:path,p_mime_type:file.type,p_byte_size:file.size,p_duration_seconds:durationSeconds??null,p_client_request_id:crypto.randomUUID()});
  if(error){ await supabase.storage.from(VOICE_NOTE_BUCKET).remove([path]); throw error; }
  return data as string;
}

export async function getVoiceNoteUrl(path:string){
  const {data,error}=await supabase.storage.from(VOICE_NOTE_BUCKET).createSignedUrl(path,300);
  if(error) throw error; return data.signedUrl;
}
