const fs=require('fs'),vm=require('vm'),path=require('path');
const root=process.argv[2]||process.cwd();
const src=fs.readFileSync(path.join(root,'assets/js/data.js'),'utf8');
const context={window:{}};vm.createContext(context);vm.runInContext(src,context,{filename:'data.js'});
const D=context.window.MS_DATA;if(!D)throw Error('MS_DATA_NOT_LOADED');
const ex=new Map(D.exercises.map(x=>[x.id,x]));
const plans=D.sessionPlans||{};
const expectedCodes=['foundation3','upperlower4','ppl6','hypertrophy5','strength4','recomp4','busy3','calisthenics3','fatloss4','ppl5','arnold6','dumbbell4','athletic4'];
const fail=m=>{throw Error(m)};
const day=(code,name)=>{const d=plans[code]?.find(x=>x.name===name);if(!d)fail('DAY_MISSING '+code+' '+name);return d};
const ids=d=>d.items.map(i=>Array.isArray(i)?i[0]:i?.exercise_id).filter(Boolean);
const countGroup=(d,groups)=>ids(d).filter(id=>groups.includes(ex.get(id)?.muscle)).length;
for(const code of expectedCodes){
  const p=D.programs.find(x=>x.code===code);if(!p)fail('PROGRAM_MISSING '+code);
  const sessions=plans[code];if(!Array.isArray(sessions)||!sessions.length)fail('SESSIONS_MISSING '+code);
  if(p.days!==sessions.length)fail('PROGRAM_DAY_COUNT_MISMATCH '+code+' '+p.days+' '+sessions.length);
  if(JSON.stringify(p.dayNames)!==JSON.stringify(sessions.map(s=>s.name)))fail('PROGRAM_DAY_NAMES_MISMATCH '+code);
  const derived=[...new Set(sessions.flatMap(ids))];
  if(JSON.stringify(p.exerciseIds)!==JSON.stringify(derived))fail('PROGRAM_EXERCISE_IDS_NOT_SYNCED '+code);
  for(const s of sessions){
    const list=ids(s),unique=new Set(list);
    if(list.length!==unique.size)fail('DUPLICATE_EXERCISE '+code+' '+s.name);
    for(const id of list)if(!ex.has(id))fail('UNKNOWN_EXERCISE '+code+' '+s.name+' '+id);
    const conditioning=(code==='fatloss4'&&s.name==='Conditioning')||(code==='athletic4'&&s.name==='Conditioning');
    if(!conditioning&&list.length<7)fail('RESISTANCE_DAY_TOO_SHORT '+code+' '+s.name+' '+list.length);
    if(list.length>9)fail('DAY_TOO_LONG '+code+' '+s.name+' '+list.length);
  }
}
const CHEST=['صدر'],BACK=['ظهر'],SHOULDER=['كتف','كتف خلفي'],BICEPS=['باي'],TRICEPS=['تراي'],QUAD=['رجل'],POSTERIOR=['خلفية','جلوتس'],CALF=['سمانة'];
function exact(code,name,checks,total){const d=day(code,name);for(const [label,groups,n] of checks){const got=countGroup(d,groups);if(got!==n)fail('BALANCE_'+label+' '+code+' '+name+' expected='+n+' got='+got)}if(total&&ids(d).length!==total)fail('BALANCE_TOTAL '+code+' '+name+' expected='+total+' got='+ids(d).length)}
for(const [code,name] of [['hypertrophy5','صدر + ظهر'],['arnold6','Chest + Back A'],['arnold6','Chest + Back B']])exact(code,name,[['CHEST',CHEST,3],['BACK',BACK,3]],7);
for(const [code,name] of [['ppl6','Push A'],['ppl6','Push B'],['ppl5','Push']])exact(code,name,[['CHEST',CHEST,3],['SHOULDER',SHOULDER,3],['TRICEPS',TRICEPS,3]],9);
for(const [code,name] of [['ppl6','Pull A'],['ppl6','Pull B'],['ppl5','Pull']])exact(code,name,[['BACK',BACK,3],['BICEPS',BICEPS,3]],7);
for(const [code,name] of [['hypertrophy5','كتف + ذراع'],['arnold6','Shoulders + Arms A'],['arnold6','Shoulders + Arms B']])exact(code,name,[['SHOULDER',SHOULDER,3],['BICEPS',BICEPS,3],['TRICEPS',TRICEPS,3]],9);
for(const [code,name] of [
 ['upperlower4','Lower A'],['upperlower4','Lower B'],['ppl6','Legs A'],['ppl6','Legs B'],['hypertrophy5','رجل'],['hypertrophy5','Lower'],['strength4','Squat Focus'],['recomp4','Lower'],['fatloss4','Lower'],['ppl5','Legs'],['arnold6','Legs A'],['arnold6','Legs B'],['dumbbell4','Lower A'],['dumbbell4','Lower B']
])exact(code,name,[['QUAD',QUAD,3],['POSTERIOR',POSTERIOR,3]],7);
for(const [code,name] of [['upperlower4','Upper A'],['upperlower4','Upper B'],['hypertrophy5','Upper'],['recomp4','Upper'],['fatloss4','Upper']])exact(code,name,[['CHEST',CHEST,3],['BACK',BACK,3]],7);
const totalSessions=expectedCodes.reduce((n,c)=>n+plans[c].length,0);
if(totalSessions!==55)fail('TOTAL_SESSION_COUNT '+totalSessions);
console.log('V101816_TRAINING_QA_PASS');
console.log('programs=13');
console.log('sessions='+totalSessions);
console.log('paired_muscle_days=THREE_PLUS_THREE_FINISHER');
console.log('push_days=THREE_CHEST_THREE_SHOULDER_THREE_TRICEPS');
console.log('pull_days=THREE_BACK_THREE_BICEPS_FINISHER');
console.log('leg_days=THREE_QUAD_THREE_POSTERIOR_FINISHER');
console.log('conditioning_days=DEFERRED_TO_CARDIO_SYSTEM');