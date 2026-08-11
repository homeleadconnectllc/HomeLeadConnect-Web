import{createClient}from"npm:@supabase/supabase-js@2.110.0";
const reply=(status:number,body:unknown)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, apikey, content-type"}});
Deno.serve(async request=>{if(request.method==="OPTIONS")return reply(200,{});if(request.method!=="POST")return reply(405,{error:"Method not allowed."});
 const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY");
 if(!url||!anon)return reply(503,{error:"Calendar service is unavailable."});
 const authorization=request.headers.get("Authorization");if(!authorization)return reply(401,{error:"Authentication required."});const user=createClient(url,anon,{global:{headers:{Authorization:authorization}}});const auth=await user.auth.getUser();if(!auth.data.user)return reply(401,{error:"Authentication required."});
 const body=await request.json().catch(()=>null);if(!body?.appointmentId)return reply(400,{error:"Appointment is required."});const appointment=await user.from("appointments").select("id,workspace_id,appointment_date,notes,status,job:crm_jobs(name)").eq("id",body.appointmentId).single();if(appointment.error)return reply(403,{error:"Appointment access denied."});
 // Google Calendar requires an event end after its start. HLC currently stores
 // only appointment_date, so fail closed until the product duration contract is
 // persisted rather than inventing a provider-only default.
 return reply(409,{error:"Appointment end time is not defined in HLC. Calendar synchronization is unavailable until the duration contract is configured."});
});
