(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function t(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(o){if(o.ep)return;o.ep=!0;const n=t(o);fetch(o.href,n)}})();const Yt="If anyone is in immediate danger, call 999 (or 112) straight away.",Le=[{id:"gas",label:"Gas appliances or gas pipework",severity:"block",professional:"a Gas Safe registered engineer",risk:"Work on gas appliances, gas pipework or gas fittings can cause gas leaks, fire, explosion or carbon monoxide poisoning. In Great Britain, gas work must be carried out by a Gas Safe registered engineer.",safePreparation:["Note the make and model of the appliance (usually on a data plate or in the manual).","Write down what you have noticed: noises, error codes, when the problem started.","Check whether the appliance is still under warranty or covered by a service plan.","Make sure you have a working carbon monoxide alarm near fuel-burning appliances."],questions:["Can I see your Gas Safe ID card, and are you registered for this type of appliance?","What do you think the fault is, and what will the repair involve?","Is the appliance safe to keep using until it is repaired?","Will I receive a written quote and any relevant safety paperwork afterwards?"],emergency:"If you smell gas or suspect a leak: do not use switches or naked flames, open doors and windows, turn off the gas at the meter if it is safe to do so, leave the property and call the National Gas Emergency Service on 0800 111 999. If anyone feels unwell, call 999.",patterns:[/\bgas\b[\w\s,'-]{0,40}\b(boiler|cooker|hob|oven|fire|heater|meter|pipe|pipes|pipework|supply|valve|leak|appliance|line|fitting|bayonet|tap|cylinder|bottle)s?\b/i,/\b(boiler|combi)\b[\w\s,'-]{0,40}\b(repair|fix|service|servicing|install|installing|replace|replacing|remove|removing|open|opening|strip|dismantle|disassemble|relight|re-light|flue|burner|gas valve|diverter|heat exchanger|pcb|fan|ignit\w*)\b/i,/\b(repair|fix|service|install|replace|remove|move|relocate|disconnect|connect)\b[\w\s,'-]{0,30}\b(boiler|gas)\b/i,/\b(smell(ing)? (of )?gas|gas leak|leaking gas|carbon monoxide)\b/i,/\b(lpg|propane|butane)\b[\w\s,'-]{0,30}\b(regulator|pipe|connect|install|refill|fit)\w*\b/i],allow:[/\b(top(ping)?[ -]?up|re-?pressuri[sz]e|repressuri[sz]e)\b[\w\s,'-]{0,30}\bboiler\b/i,/\bboiler\b[\w\s,'-]{0,30}\b(pressure)\b[\w\s,'-]{0,20}\b(top(ping)?[ -]?up|low|drop(ped|ping)?)\b/i,/\bbleed(ing)?\b[\w\s,'-]{0,20}\bradiators?\b/i]},{id:"electrical",label:"Mains electrical work",severity:"block",professional:"a registered electrician (for example, one registered with a government-approved competent person scheme)",risk:"Mains electricity can cause fatal electric shock and fires. Faults are often invisible, and work on fixed wiring may need to be notified and certified.",safePreparation:["Write down exactly what is happening (for example, which circuit trips and when).","Note any burning smells, scorch marks, buzzing or warm sockets and stop using that outlet.","Find where your consumer unit (fuse box) is so the electrician can get to it easily.","Take clear photos of the problem from a safe distance without removing any covers."],questions:["Which competent person scheme are you registered with?","Will this work need to be notified, and will I receive a certificate?","Will you test the circuit after the work, and what will the test show?","Is it safe to keep using the rest of the electrics in the meantime?"],emergency:"If there is smoke, burning or sparking, keep clear and call 999 if there is any fire. For a power cut or damaged power lines, call 105.",patterns:[/\b(consumer unit|fuse ?box|fuse ?board|distribution board|breaker panel)\b/i,/\b(re-?wir(e|ing)|wire up|wiring|hard-?wir(e|ed|ing))\b[\w\s,'-]{0,40}\b(socket|switch|light|lamp fitting|ceiling|circuit|house|room|cooker|shower|spur|outlet|fan|heater|charger|immersion)\w*/i,/\b(install|fit|add|move|replace|extend|relocate)\b[\w\s,'-]{0,30}\b(sockets?|plug sockets?|power points?|outlets?|light switch(es)?|dimmer switch(es)?|light fittings?|ceiling lights?|ceiling roses?|downlights?|spotlights?|spurs?|fused spurs?|circuits?|electric shower|ev charger|immersion heater|extractor fan)\b/i,/\b(mains (electric\w*|voltage|power|cable|wiring))\b/i,/\b(live (wire|cable|terminal)s?|three[- ]phase|230 ?v|240 ?v)\b/i,/\b(electric(al)? (rewire|installation work))\b/i],allow:[/\b(change|replace|swap)\b[\w\s,'-]{0,20}\b(light ?bulb|bulb|lamp)\b/i,/\b(reset|switch back on)\b[\w\s,'-]{0,30}\b(trip(ped)? switch|rcd|mcb|breaker|trip)\b/i,/\b(change|replace)\b[\w\s,'-]{0,20}\bfuse\b[\w\s,'-]{0,20}\bplug\b/i,/\bplug\b[\w\s,'-]{0,20}\bfuse\b/i]},{id:"structural",label:"Structural alterations",severity:"block",professional:"a structural engineer and an experienced builder (Building Control may also need to be involved)",risk:"Removing or altering load-bearing parts of a building can cause collapse, serious injury and costly damage, and usually needs calculations and approvals.",safePreparation:["Gather any plans, surveys or previous building work paperwork for the property.","Describe what you want to achieve (for example, an open-plan kitchen) rather than how.","Note any cracks, sagging or movement and when you first noticed them."],questions:["Is this wall or element load-bearing, and how was that established?","Will the work need Building Regulations approval or a party wall agreement?","Who will provide structural calculations and temporary support?"],patterns:[/\bload[- ]?bearing\b/i,/\b(knock(ing)? (down|through)|remove|removing|demolish|take out|taking out)\b[\w\s,'-]{0,30}\b(walls?|chimney breast|chimney stack|supporting wall|internal wall|beam|joists?|pillar|column)\b/i,/\b(rsj|steel beam|lintel|underpin\w*|foundations?|cut(ting)? (through )?joists?|notch(ing)? joists?|structural)\b/i],allow:[/\b(stud wall)\b[\w\s,'-]{0,30}\b(shelf|shelves|picture|tv|hang|mount|fix(ing)?)\b/i]},{id:"asbestos",label:"Asbestos or unidentified hazardous materials",severity:"block",professional:"a licensed or accredited asbestos surveyor or removal contractor",risk:"Asbestos fibres can cause serious lung disease decades later. Materials cannot be identified safely by eye or from a photo; they need sampling and testing.",safePreparation:["Leave the material undisturbed: do not drill, sand, scrape, cut or break it.","Keep people and pets away from any damaged or crumbling material.","Find out roughly when the building, or that part of it, was built or last altered."],questions:["Can you sample and test the material, and how long will results take?","If it contains asbestos, is it better managed in place or removed?","What precautions should we take in the meantime?"],patterns:[/\basbestos\b/i,/\bartex\b/i,/\b(remove|removing|scrape|scraping|sand|sanding|drill(ing)? into)\b[\w\s,'-]{0,30}\b(textured ceiling|popcorn ceiling|old floor tiles|bitumen adhesive|old insulation|lagging)\b/i,/\b(unknown|unidentified|mystery)\b[\w\s,'-]{0,20}\b(powder|dust|chemical|substance|material|liquid)\b/i]},{id:"fire_safety",label:"Fire-safety systems",severity:"block",professional:"a competent fire-safety engineer or installer (for example, one third-party certified for fire alarm or sprinkler systems)",risk:"Fire alarm, sprinkler, emergency lighting and fire-door systems protect lives. Incorrect work can leave people unprotected without anyone realising.",safePreparation:["Note the make and model of the system or device and any fault codes or warning lights.","For a home smoke alarm, check the manufacturer’s instructions and test button."],questions:["Is the system fully working after your visit, and how was it tested?","Will I receive any commissioning or service records?"],emergency:"If there is a fire, get everyone out, stay out and call 999.",patterns:[/\b(fire alarm (system|panel)|sprinkler (system|head)s?|emergency lighting|fire suppression|fire curtain|aov|smoke vent)\b/i,/\b(install|fit|modify|alter|cut|trim|plane|repair|remove)\b[\w\s,'-]{0,20}\bfire ?doors?\b/i,/\b(disable|disconnect|silence permanently|remove|cover)\b[\w\s,'-]{0,20}\b(smoke|heat|fire|carbon monoxide|co)\s?(alarms?|detectors?)\b/i,/\b(refill|recharge)\b[\w\s,'-]{0,20}\bfire extinguishers?\b/i],allow:[/\b(test|change|replace)\b[\w\s,'-]{0,20}\b(battery|batteries)\b/i]},{id:"high_pressure",label:"High-pressure or stored-energy systems",severity:"block",professional:"a qualified heating engineer holding the relevant unvented hot water qualification, or the equipment manufacturer’s approved service agent",risk:"Pressure vessels, unvented hot-water cylinders and compressed-gas systems store a large amount of energy. Failure or incorrect work can cause scalding, explosion or serious injury.",safePreparation:["Note the make, model and any data plate information on the equipment.","Record any dripping from discharge pipes, pressure readings or warning lights.","Keep the area around the equipment clear for the engineer."],questions:["Are you qualified to work on this specific type of pressurised system?","Which safety valves will you check or replace, and why?"],patterns:[/\b(unvented (hot water )?cylinder|megaflo|pressure vessel|compressor tank|air receiver|hydraulic (system|line|hose|ram))\b/i,/\b(pressure relief valve|temperature (and|&) pressure relief|t ?& ?p valve|tundish)\b/i,/\b(recharge|repressuri[sz]e|re-?gas)\b[\w\s,'-]{0,20}\b(expansion vessel|air con\w*|refrigerant|fridge|freezer|heat pump)\b/i,/\b(refill|fill|weld)\b[\w\s,'-]{0,20}\b(gas cylinder|co2 cylinder|scuba tank|oxygen (tank|cylinder)|propane tank)\b/i]},{id:"heights",label:"Working at dangerous heights",severity:"block",professional:"a roofer or contractor trained and equipped for safe working at height (with scaffolding or access equipment where needed)",risk:"Falls from roofs, chimneys and scaffolding are a leading cause of serious and fatal injuries in home and building work.",safePreparation:["Look at the problem from the ground with binoculars or a camera zoom and note what you see.","Check inside the loft for damp, daylight or drips beneath the area.","Put a bucket or tray under any internal leak and move valuables away."],questions:["How will you access the area safely, and do you need scaffolding?","What exactly needs repairing, and can you show me photos of the problem?","Is the repair guaranteed, and for how long?"],patterns:[/\b(on|onto|up on|climb(ing)? (on|onto)|walk(ing)? on|repair(ing)?|fix(ing)?|replace|replacing)\b[\w\s,'-]{0,20}\b(the )?(roof|roof tiles?|slates?|chimney|chimney pot|ridge tiles?|flat roof|skylight from outside)\b/i,/\b(scaffold\w*|second[- ]stor[e]?y|third[- ]stor[e]?y|three[- ]stor[e]?y)\b/i,/\b(roofing|roofer job|chimney sweep\w* from (the )?roof)\b/i]},{id:"weapons",label:"Weapons, explosives or ammunition",severity:"block",professional:"the appropriate licensed authority (for legal sporting or collecting activities, a licensed dealer or recognised club)",risk:"APTO Solve does not provide instructions for making, modifying or using weapons, ammunition or explosives.",safePreparation:[],questions:[],patterns:[/\b(firearms?|pistols?|rifles?|shotguns?|handguns?|revolvers?|ammunition|ammo|bullets?|silencers?|suppressors?|explosives?|bombs?|grenades?|detonators?|napalm|thermite|molotov|pipe bomb|zip gun|ghost gun)\b/i,/\b(make|making|build|building|3d[- ]?print\w*|modify|modifying|convert\w*)\b[\w\s,'-]{0,30}\b(gun|guns|weapon|weapons|crossbow|taser|stun gun|pepper spray|knuckle ?dusters?|flick ?knife|gunpowder|black powder)\b/i],allow:[/\b(glue|nail|heat|caulk|caulking|spray|staple|grease|sealant|silicone|paint)\s?guns?\b/i],historyDowngrade:!0},{id:"bypass",label:"Bypassing or disabling safety devices",severity:"block",professional:"a qualified engineer or the equipment manufacturer",risk:"Safety devices such as trips, interlocks, thermostats and cut-outs exist to prevent fire, shock and injury. Bypassing them hides the real fault and removes your protection.",safePreparation:["Write down what the safety device is doing (for example, tripping or cutting out) and when.","Stop using the equipment until it has been checked."],questions:["Why is the safety device operating, and what is the underlying fault?"],patterns:[/\b(bypass\w*|override|overrid\w*|defeat\w*|disabl\w*|jump(er)?|bridge|bridging|tamper\w*)\b[\w\s,'-]{0,30}\b(safety|interlock|thermostat|thermal cut[- ]?out|cut[- ]?out|rcd|trip switch|fuse|pressure switch|limit switch|guard|airbag|immobili[sz]er|speed limiter|lid switch|door interlock)s?\b/i,/\btamper\w*\b[\w\s,'-]{0,20}\b(meter|seal)s?\b/i,/\b(gas|electric\w*|water) meter\b[\w\s,'-]{0,20}\b(bypass|tamper|slow down|stop|move|remove)\w*/i]},{id:"illegal",label:"Illegal activity",severity:"block",professional:"a solicitor or Citizens Advice if you need advice on a legal problem",risk:"APTO Solve cannot help with activities that are illegal or could harm other people.",safePreparation:[],questions:[],patterns:[/\b(hot ?wir(e|ing)|break(ing)? into|steal\w*|shoplift\w*|burgl\w*|launder\w* money|counterfeit\w*|forg(e|ing) (a |an )?(signature|document|passport|id|licence|license)|fake (id|passport|driving licen[cs]e))\b/i,/\b(hack\w*|access|get into)\b[\w\s,'-]{0,20}\b(someone(?:'s)?|other people'?s?|my (ex|partner|boss)(?:'s)?|neighbou?r'?s?)\b[\w\s,'-]{0,20}\b(account|phone|email|wifi|computer|camera)\b/i,/\b(make|making|cook\w*|grow\w*|synthesi[sz]\w*)\b[\w\s,'-]{0,20}\b(meth\w*|cocaine|heroin|mdma|lsd|ketamine|fentanyl|crack|cannabis|weed)\b/i,/\b(spy on|track(ing)? someone|stalk\w*|without (them|their) knowing)\b/i,/\b(card skimm\w*|phishing|ransomware|malware|keylogger)\b/i],historyDowngrade:!0},{id:"vehicle",label:"High-risk vehicle repairs",severity:"block",professional:"a qualified vehicle technician or a reputable garage",risk:"Brakes, steering, suspension springs, airbags, fuel systems and high-voltage electric-vehicle components are safety-critical. Mistakes can cause crashes, fire or serious injury.",safePreparation:["Note the make, model, year and mileage of the vehicle.","Write down the symptoms: noises, warning lights, vibrations and when they occur.","Do not drive the vehicle if brakes, steering or tyres feel unsafe."],questions:["What is the fault, and is the vehicle safe to drive until it is repaired?","Can I see the worn or damaged parts that were replaced?","Will the work be covered by a guarantee?"],patterns:[/\b(brakes?|brake (pads?|discs?|lines?|fluid|calipers?|hoses?|shoes?|drums?)|abs)\b[\w\s,'-]{0,30}\b(car|van|vehicle|motorbike|motorcycle|replace|change|fix|repair|bleed|install)\w*/i,/\b(replace|change|fix|repair|bleed|install)\b[\w\s,'-]{0,30}\b(car|van|vehicle|motorbike|motorcycle)?\s?(brakes?|brake (pads?|discs?|lines?|fluid|calipers?))\b(?![\w\s,'-]{0,30}\bbi(ke|cycle)\b)/i,/\b(airbags?|steering (rack|column|arm|knuckle)|tie rods?|ball joints?|coil springs?|spring compressor|suspension springs?|fuel (line|pump|tank|injector)s?|timing (belt|chain)|split rims?|high[- ]voltage battery|ev battery|hybrid battery)\b/i],allow:[/\b(bike|bicycle|cycle)\b/i]},{id:"medical",label:"Medical diagnosis or treatment",severity:"block",professional:"a GP, pharmacist or NHS 111 (or the equivalent health service where you live)",risk:"APTO Solve cannot examine you or assess symptoms. Medical diagnosis, treatment and medication decisions need a qualified health professional.",safePreparation:["Write down your symptoms, when they started and anything that makes them better or worse.","List any medicines you take, including doses, and any allergies."],questions:["What could be causing this, and are any tests needed?","What warning signs mean I should seek urgent help?"],emergency:"If someone has chest pain, difficulty breathing, severe bleeding, signs of a stroke or is unconscious, call 999 immediately. For urgent advice that is not an emergency in the UK, contact NHS 111.",patterns:[/\b(diagnos\w*|my symptoms?|what(?:'s| is) wrong with (me|my)|should i take|dosage|dose of|how (much|many) (paracetamol|ibuprofen|aspirin|codeine|tablets|pills|mg))\b/i,/\b(treat|cure|heal|stitch|suture|lance|drain)\b[\w\s,'-]{0,20}\b(my|a|this|the)?\s?(infection|wound|burn|rash|lump|mole|abscess|fracture|broken bone|cut|injury|illness|disease|condition|cancer|diabetes|depression|anxiety)\b/i,/\b(chest pain|can'?t breathe|overdose|stroke symptoms|heart attack|anaphyla\w*|seizure)\b/i,/\b(prescri(be|ption)|antibiotics?|stop taking my medication)\b/i]},{id:"self_harm",label:"Personal safety and wellbeing",severity:"block",professional:"someone you trust, your GP, NHS 111 (option 2 for mental health in England) or Samaritans on 116 123 (free, 24 hours)",risk:"It sounds like you might be going through something difficult. You do not have to deal with it alone, and talking to someone can help.",safePreparation:[],questions:[],emergency:"If you are in immediate danger or might act on thoughts of harming yourself, call 999 or go to A&E now. You can call Samaritans free on 116 123 at any time.",patterns:[/\b(kill (myself|my ?self)|suicid\w*|end (it all|my life)|self[- ]?harm\w*|hurt(ing)? myself|want to die)\b/i]}],Xt=[{id:"ladder",label:"Working on ladders",patterns:[/\b(ladders?|step ?ladders?|gutters?|guttering|loft hatch)\b/i]},{id:"power_tools",label:"Power tools and cutting equipment",patterns:[/\b(chainsaw|angle grinder|circular saw|table saw|router|nail gun|welding|welder|plasma cutter|tree felling|fell(ing)? a tree)\b/i]},{id:"chemicals",label:"Hazardous chemicals",patterns:[/\b(caustic soda|sodium hydroxide|drain cleaner|bleach|hydrochloric|sulphuric|sulfuric|acid|solvent|paint stripper)\b/i]},{id:"first_aid",label:"First aid",patterns:[/\b(first aid|cpr|recovery position|defibrillator|aed)\b/i]},{id:"vehicle_basic",label:"Vehicle maintenance",patterns:[/\b(jack(ing)? up|car jack|axle stands?|change (a |the )?(flat )?(tyre|tire|wheel)|car battery|jump start)\b/i]},{id:"electrical_low",label:"Low-risk electrical tasks",patterns:[/\b(trip switch|rcd|light ?bulb|plug fuse|fuse in (a|the) plug|wire a plug)\b/i]},{id:"boiler_pressure",label:"Boiler pressure top-up",patterns:[/\b(boiler pressure|filling loop|repressuri[sz]e|top(ping)? up)\b[\w\s,'-]{0,20}\bboiler\b|\bboiler\b[\w\s,'-]{0,20}\bpressure\b/i]},{id:"lock",label:"Locks and security",patterns:[/\b(lock ?pick\w*|pick(ing)? a lock|locked out)\b/i]}],Kt=/\b(history|historical|historic|war|wars|museum|medieval|ancient|victorian|tudor|century|literature|novel|film|documentary)\b/i;function Qt(e){return String(e||"").normalize("NFKC").replace(/[‘’]/g,"'").replace(/[_*~`|]/g," ").replace(/\s+/g," ").trim()}function Jt(e,a={}){const t=Qt(e),s=a.mode||"auto",o=[],n=[];for(const i of Le)if(i.patterns.some(d=>d.test(t))){if((i.allow||[]).some(d=>d.test(t))){n.push({id:i.id,label:i.label,reason:"allowlisted low-risk action"});continue}if(i.historyDowngrade&&s!=="practical"&&Kt.test(t)){n.push({id:i.id,label:i.label,reason:"historical or academic context"});continue}o.push({id:i.id,label:i.label,severity:i.severity})}for(const i of Xt)i.patterns.some(d=>d.test(t))&&n.push({id:i.id,label:i.label});const l=o.find(i=>i.severity==="block"),c=l?Le.find(i=>i.id===l.id):null;return{decision:c?"block":n.length?"restrict":"allow",blocked:c,matches:o,restricted:n}}function Zt(e,a=""){const t=typeof e=="string"?Le.find(o=>o.id===e):e;if(!t)throw new Error("Unknown safety category");const s=String(a||"").slice(0,120);return{type:"refuse",rating:"red",category:t.id,title:t.id==="self_harm"?"Let’s get you some support":"This needs a qualified professional",request:s,risk:t.risk,professional:t.professional,safePreparation:[...t.safePreparation||[]],questionsForProfessional:[...t.questions||[]],emergency:t.emergency||(t.id==="weapons"||t.id==="illegal"?"":Yt),source:"app-screen"}}const x=(e=600,a)=>({type:"string",maxLength:e,...a?{description:a}:{}}),z=(e,a=300,t)=>({type:"array",items:x(a),maxItems:e,...t?{description:t}:{}}),Lt={type:"string",enum:["amber","green","red"]},Qe={type:"object",properties:{type:{type:"string",enum:["mcq","short"]},question:x(400),options:z(5,200,"For mcq: 3-4 options. For short: empty array."),answerIndex:{type:"integer",description:"For mcq: zero-based index of the correct option. For short: -1."},acceptableKeywords:z(8,60,"For short answers: key words or phrases a correct answer would contain."),modelAnswer:x(400),explanation:x(500),topic:x(80,"Short topic label used to track weak areas.")},required:["type","question","options","answerIndex","modelAnswer","explanation","topic"]},ea={type:"object",properties:{id:x(40),question:x(200),kind:{type:"string",enum:["choice","text"]},options:z(6,80),why:x(200)},required:["id","question","kind","options"]},ta={type:"object",properties:{type:{type:"string",enum:["practical","course","refuse"]},title:x(90),summary:x(400),rating:Lt,ratingReason:x(400),risk:x(500),professional:x(200),safePreparation:z(6),questionsForProfessional:z(6),emergency:x(400),photoHelpful:{type:"boolean"},photoPrompt:x(250),observations:z(6,250,"Only what is directly visible in any photo."),assumptions:z(6,250),uncertainties:z(6,250),questions:{type:"array",items:ea,maxItems:4}},required:["type","title","summary","rating","ratingReason","questions"]},pt={type:"object",properties:{name:x(100),note:x(200)},required:["name"]},aa={type:"object",properties:{title:x(90),goal:x(300),rating:Lt,ratingReason:x(500),estimatedTime:x(60),observations:z(8,250),assumptions:z(8,250),uncertainties:z(8,250),professional:x(200),stopConditions:z(8,250),safetyChecklist:z(10,250),tools:{type:"array",items:pt,maxItems:15},materials:{type:"array",items:pt,maxItems:15},preparation:{type:"array",maxItems:8,items:{type:"object",properties:{title:x(100),detail:x(500)},required:["title","detail"]}},steps:{type:"array",maxItems:15,items:{type:"object",properties:{title:x(100),instruction:x(600),detail:x(800),tip:x(300),warning:x(300),checkpoint:{type:"boolean"},checkpointQuestion:x(250)},required:["title","instruction","checkpoint"]}},troubleshooting:{type:"array",maxItems:10,items:{type:"object",properties:{problem:x(200),solution:x(500)},required:["problem","solution"]}},completionChecklist:z(10,250)},required:["title","goal","rating","ratingReason","safetyChecklist","tools","materials","preparation","steps","troubleshooting","completionChecklist","stopConditions"]},sa={type:"object",properties:{message:x(1200),bullets:z(8,300),observations:z(6,250),uncertainties:z(6,250),shouldStop:{type:"boolean"},stopReason:x(400)},required:["message","bullets","shouldStop"]},Tt={type:"object",properties:{title:x(100),minutes:{type:"integer"},objectives:z(4,200),sections:{type:"array",maxItems:4,items:{type:"object",properties:{heading:x(100),body:x(900)},required:["heading","body"]}},workedExample:{type:"object",properties:{title:x(120),body:x(1200)},required:["title","body"]},keyPoints:z(5,200),quiz:{type:"array",items:Qe,maxItems:4}},required:["title","minutes","objectives","sections","workedExample","keyPoints","quiz"]},oa={type:"object",properties:{title:x(90),objective:x(400),level:x(40),roadmap:{type:"array",maxItems:8,items:{type:"object",properties:{stage:x(60),title:x(100),summary:x(300)},required:["stage","title","summary"]}},lessons:{type:"array",items:Tt,minItems:5,maxItems:5},finalAssessment:{type:"array",items:Qe,maxItems:8}},required:["title","objective","level","roadmap","lessons","finalAssessment"]},na={type:"object",properties:{message:x(1500),example:x(1200),bullets:z(6,300),quiz:{type:"array",items:Qe,maxItems:5}},required:["message","bullets","quiz"]},ra={type:"object",properties:{note:x(400),lessons:{type:"array",items:Tt,minItems:1,maxItems:3}},required:["note","lessons"]},ia={type:"object",properties:{type:{type:"string",enum:["refuse"]},rating:{type:"string",enum:["red"]},category:x(40),title:x(120),request:x(200),risk:x(600),professional:x(300),safePreparation:z(8),questionsForProfessional:z(8),emergency:x(500),source:x(30)},required:["type","rating","title","risk","professional"]},ht={assess:ta,practical_plan:aa,step_help:sa,course_plan:oa,course_help:na,adapt_course:ra,refusal:ia};function la(e,a,t="$"){const s=[],o=Ue(e,a,t,s,!0);return{valid:s.length===0,errors:s,value:o}}function Be(e){switch(e.type){case"string":return"";case"array":return[];case"boolean":return!1;case"integer":case"number":return 0;case"object":{const a={};for(const[t,s]of Object.entries(e.properties||{}))a[t]=Be(s);return a}default:return null}}function Ue(e,a,t,s,o){if(a==null)return o&&s.push(`${t} is required`),Be(e);switch(e.type){case"string":{if(typeof a!="string")if(typeof a=="number"||typeof a=="boolean")a=String(a);else return s.push(`${t} must be a string`),"";let n=a.replace(/\u0000/g,"").trim();if(e.enum){const l=n.toLowerCase();if(!e.enum.includes(l))return s.push(`${t} must be one of ${e.enum.join(", ")}`),e.enum[0];n=l}return e.maxLength&&n.length>e.maxLength&&(n=n.slice(0,e.maxLength-1).trimEnd()+"…"),n}case"integer":case"number":{const n=typeof a=="string"?Number(a):a;return typeof n!="number"||Number.isNaN(n)?(s.push(`${t} must be a number`),0):e.type==="integer"?Math.round(n):n}case"boolean":return typeof a=="boolean"?a:a==="true"||a==="false"?a==="true":(s.push(`${t} must be a boolean`),!1);case"array":{if(!Array.isArray(a))return s.push(`${t} must be an array`),[];let n=a;e.maxItems&&n.length>e.maxItems&&(n=n.slice(0,e.maxItems));const l=n.map((c,i)=>Ue(e.items,c,`${t}[${i}]`,s,!0));return e.minItems&&l.length<e.minItems&&s.push(`${t} needs at least ${e.minItems} items`),l}case"object":{if(typeof a!="object"||Array.isArray(a))return s.push(`${t} must be an object`),Be(e);const n={},l=new Set(e.required||[]);for(const[c,i]of Object.entries(e.properties||{}))n[c]=Ue(i,a[c],`${t}.${c}`,s,l.has(c));return n}default:return a}}const Rt="aptosolve:v1",Fe=new Set;function Pt(){var e;return(e=globalThis.crypto)!=null&&e.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,a=>{const t=Math.random()*16|0;return(a==="x"?t:t&3|8).toString(16)})}function qe(){return{version:1,clientId:Pt(),consent:{photos:!1},usage:{day:"",count:0,serverRemaining:null},learnerName:"",draft:null,items:{}}}let J=null,Te=!0;function X(){if(J)return J;try{const e=localStorage.getItem(Rt);J=e?{...qe(),...JSON.parse(e)}:qe(),(!J.items||typeof J.items!="object")&&(J.items={})}catch{Te=!1,J=qe()}return J}function ye(){try{localStorage.setItem(Rt,JSON.stringify(J)),Te=!0}catch{Te=!1}Fe.forEach(e=>e(J))}const R={get state(){return X()},get storageAvailable(){return X(),Te},get clientId(){return X().clientId},update(e){e(X()),ye()},subscribe(e){return Fe.add(e),()=>Fe.delete(e)},newId:()=>Pt().slice(0,8),getItem(e){return X().items[e]||null},listItems(){return Object.values(X().items).sort((e,a)=>(a.updatedAt||0)-(e.updatedAt||0))},saveItem(e){return e.updatedAt=Date.now(),X().items[e.id]=e,ye(),e},deleteItem(e){delete X().items[e],ye()},clearAll(){const e=X().clientId,a=X().usage;J={...qe(),clientId:e,usage:a},ye()},setDraft(e){X().draft=e,ye()},getDraft(){return X().draft},exportJson(){const e=X();return JSON.stringify({exportedAt:new Date().toISOString(),learnerName:e.learnerName,items:e.items},null,2)},_reset(){J=null}},H=Object.freeze({DAILY_REQUEST_LIMIT:5,IP_LIMIT_MULTIPLIER:3,MIN_REQUEST_INTERVAL_MS:2500,MAX_REQUEST_CHARS:500,MAX_ANSWER_CHARS:400,MAX_ANSWERS:6,MAX_CONTEXT_CHARS:4e3,MAX_IMAGES_PER_REQUEST:3,MAX_RAW_IMAGE_BYTES:15*1024*1024,IMAGE_MAX_EDGE_PX:1600,MAX_UPLOAD_IMAGE_BYTES:1.2*1024*1024,MAX_BODY_BYTES:5.5*1024*1024}),ca=Object.freeze(["image/jpeg","image/png","image/webp"]),G=H.DAILY_REQUEST_LIMIT,bt=()=>new Date().toISOString().slice(0,10);function De(e){return e.usage.day!==bt()&&(e.usage={day:bt(),count:0,serverRemaining:null}),e.usage}function te(){const e=De(R.state),a=Math.max(0,G-e.count);return e.serverRemaining===null||e.serverRemaining===void 0?a:Math.min(a,e.serverRemaining)}function da(e){R.update(a=>{const t=De(a);t.count+=1,e&&Number.isFinite(e.remaining)&&(t.serverRemaining=e.remaining)})}function Ge(e){!e||!Number.isFinite(e.remaining)||R.update(a=>{const t=De(a);t.serverRemaining=e.remaining})}function ua(){R.update(e=>{const a=De(e);a.count=Math.max(a.count,G),a.serverRemaining=0})}function $e(){const e=document.getElementById("usage-pill");if(!e)return;const a=te(),t=e.querySelector(".usage-dots"),s=e.querySelector(".usage-text"),o=Math.min(G,10);t.innerHTML=Array.from({length:o},(n,l)=>`<i class="${l<o-Math.round(a/G*o)?"used":""}"></i>`).join(""),s.textContent=`${a} of ${G} free left today`,e.classList.toggle("empty",a===0),e.setAttribute("aria-label",`${a} of ${G} free left today – view progress`)}function pa(e=new Date){return new Date(Date.UTC(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate()+1))}function Je(e=new Date){const a=pa(e),t=a.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit"}),s=a.toDateString()===e.toDateString();return`${t}${s?" today":" tomorrow"} (your local time)`}const Ct="/solve/api/ai",ha=6e4;class K extends Error{constructor(a,t,s=0){super(t),this.code=a,this.status=s}}let Ie=!1;const be=()=>Ie,pe={get DAILY_LIMIT(){return`You’re out of free requests today. You’ve used all ${G} – they reset at ${Je()}. Your saved progress is still here.`},AI_RATE_LIMIT:"The free AI service is busy right now. Please wait a minute and try again.",NETWORK:"We could not reach APTO Solve. Please check your internet connection and try again.",TIMEOUT:"This is taking longer than expected. Please try again – shorter requests are usually quicker.",BUSY:"Please wait – your previous request is still being processed."};function ba(e){var t;const a=[e.request||""];for(const s of e.answers||[])a.push(s.answer||"");return(t=e.context)!=null&&t.note&&a.push(e.context.note),a.join(`
`)}async function we(e,a={},t={}){var c,i,d,p,u,v;if(Ie)throw new K("BUSY",pe.BUSY);const s=Jt(ba(a),{mode:a.mode});if(s.decision==="block"&&e!=="step_help")return{refused:!0,data:Zt(s.blocked,a.request),source:"app-screen"};if(te()<=0)throw new K("DAILY_LIMIT",pe.DAILY_LIMIT,429);Ie=!0;const o=new AbortController,n=setTimeout(()=>o.abort("timeout"),ha),l=()=>o.abort("user");(c=t.signal)==null||c.addEventListener("abort",l);try{const $=()=>fetch(Ct,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:e,clientId:R.clientId,...a}),signal:o.signal});let b;try{if(b=await $(),b.status===429&&b.headers.get("retry-after")){const k=await b.clone().json().catch(()=>null);if(((i=k==null?void 0:k.error)==null?void 0:i.code)==="TOO_FAST"||((d=k==null?void 0:k.error)==null?void 0:d.code)==="IN_FLIGHT"){const S=Math.min(5,Number(b.headers.get("retry-after"))||2)*1e3+200;await new Promise(q=>setTimeout(q,S)),b=await $()}}}catch{throw o.signal.aborted?o.signal.reason==="user"?new K("CANCELLED","Request cancelled."):new K("TIMEOUT",pe.TIMEOUT):new K("NETWORK",pe.NETWORK)}let h=null;try{h=await b.json()}catch{h=null}if(!b.ok||!(h!=null&&h.ok)){const k=((p=h==null?void 0:h.error)==null?void 0:p.code)||(b.status===429?"AI_RATE_LIMIT":b.status>=500?"SERVER_ERROR":"ERROR"),S=k==="DAILY_LIMIT"||k==="DAILY_LIMIT_IP";S?ua():Ge(h==null?void 0:h.usage);const q=S&&pe.DAILY_LIMIT||((u=h==null?void 0:h.error)==null?void 0:u.message)||pe[k]||(b.status===404?'The AI service is not available here. If you are running locally, start the app with "npm run dev".':"Something went wrong. Please try again.");throw new K(k,q,b.status)}h.source!=="app-screen"?da(h.usage):Ge(h.usage);const w=h.refused?ht.refusal:ht[e],A=la(w,h.data);return{refused:!!h.refused,data:A.value,source:h.source}}finally{clearTimeout(n),(v=t.signal)==null||v.removeEventListener("abort",l),Ie=!1,$e()}}async function ma(){try{const e=await(await fetch(`${Ct}?clientId=${encodeURIComponent(R.clientId)}`)).json();if(e!=null&&e.ok)return Ge({remaining:e.status.remaining}),$e(),e.status}catch{}return null}const Nt=[];let Se=null,mt=!0;function Q(e,a,t){const s=[],o=new RegExp(`^${e.replace(/\/:([a-zA-Z]+)/g,(n,l)=>(s.push(l),"/([^/]+)"))}/?$`);Nt.push({re:o,keys:s,view:a,title:t})}let Dt=null;function ga(e){Dt=e}function oe(e,{replace:a=!1}={}){e=(e.startsWith("/solve")?e:"/solve"+(e==="/"?"/":e));a?history.replaceState({},"",e):history.pushState({},"",e),We()}function fa(e){for(const a of Nt){const t=e.match(a.re);if(t){const s={};return a.keys.forEach((o,n)=>{s[o]=decodeURIComponent(t[n+1])}),{...a,params:s}}}return null}function me(e){document.title=e?`${e} – APTO Solve`:"APTO Solve – learn practical skills and new subjects, step by step"}function We(){var o,n;const e=document.getElementById("app");if(typeof Se=="function")try{Se()}catch{}Se=null;const a=location.pathname.replace(/^\/solve(?=\/|$)/,"")||"/",t=fa(a),s=t?t.view:Dt;if(me((t==null?void 0:t.title)||(t?"":"Page not found")),Se=s(e,(t==null?void 0:t.params)||{})||null,document.querySelectorAll(".site-nav a").forEach(l=>{const c=(l.getAttribute("href")||"").replace(/^\/solve(?=\/|$)/,"")||"/";(c==="/"?a==="/"||a==="/start":a.startsWith(c))?l.setAttribute("aria-current","page"):l.removeAttribute("aria-current")}),(o=document.getElementById("site-nav"))==null||o.classList.remove("open"),(n=document.querySelector(".menu-toggle"))==null||n.setAttribute("aria-expanded","false"),!mt){const l=e.querySelector("h1");l&&(l.hasAttribute("tabindex")||l.setAttribute("tabindex","-1"),l.focus({preventScroll:!0})),window.scrollTo(0,0)}mt=!1}function ya(){document.addEventListener("click",e=>{const a=e.target.closest("a[data-link]");if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const t=new URL(a.href,location.href);t.origin===location.origin&&(e.preventDefault(),t.pathname+t.hash!==location.pathname+location.hash&&oe(t.pathname+t.search+t.hash))}),window.addEventListener("popstate",We),We()}class Oe{constructor(a){this.value=a}toString(){return this.value}}const T=e=>new Oe(String(e));function Ze(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Ot(e){return e==null||e===!1?"":e instanceof Oe?e.value:Array.isArray(e)?e.map(Ot).join(""):Ze(e)}function r(e,...a){let t="";return e.forEach((s,o)=>{t+=s,o<a.length&&(t+=Ot(a[o]))}),new Oe(t)}const Z=e=>(e||[]).filter(Boolean).map(a=>r`<li>${a}</li>`);function j(e,a){e.innerHTML=a instanceof Oe?a.value:Ze(a)}const gt={wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3.6 17.4a1.4 1.4 0 0 0 2 2l5.7-5.7a4 4 0 0 0 5.4-5.4l-2.4 2.4-2-2 2.4-2.4z"/>',book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7h8M8 11h6"/>',sparkle:'<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',camera:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',shield:'<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',stop:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M12 8v5M12 16v.5"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5V8"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',checkCircle:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',arrowRight:'<path d="M5 12h14M13 6l6 6-6 6"/>',arrowLeft:'<path d="M19 12H5M11 6l-6 6 6 6"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17v.5"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',lightbulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',refresh:'<path d="M20 11a8 8 0 0 0-14.3-4.3L4 9M4 4v5h5M4 13a8 8 0 0 0 14.3 4.3L20 15M20 20v-5h-5"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',upload:'<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',award:'<circle cx="12" cy="9" r="6"/><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5"/>',printer:'<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/>',toolbox:'<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V5h6v3M3 13h18M10 13v2h4v-2"/>',droplet:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',language:'<path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 6 6 7.5M11 5c-.5 3-3 6.5-7 8"/><path d="M13 21l4-9 4 9M14.5 18h5"/>',bike:'<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-8h5l3 8M10 8l2 8h-6M14 5h3"/>',table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',castle:'<path d="M4 21V8h3v2h2V8h2v2h2V8h2v2h2V8h3v13zM10 21v-4a2 2 0 0 1 4 0v4"/>',heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',play:'<path d="M7 4l12 8-12 8z"/>',flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',map:'<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',download:'<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>'};function f(e,a=""){const t=gt[e]||gt.info;return T(`<svg class="${a}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${t}</svg>`)}const se=70,va=.6,re=e=>(e||[]).filter(Boolean).length,Me=(e,a)=>a===0||re(e)>=a;function Ee(e){const a=e.plan,t=Me(e.checks.safety,a.safetyChecklist.length)&&(e.rating!=="amber"||e.amberAck),s=Me(e.checks.prep,a.preparation.length),o=Me(e.stepsDone,a.steps.length),n=Me(e.checks.completion,a.completionChecklist.length);return{safetyDone:t,prepDone:s,stepsDone:o,completionDone:n,canStartSteps:t&&s,canFinish:t&&s&&o}}function et(e){if(!(e!=null&&e.plan))return 0;const a=e.plan,t=(d,p)=>p?Math.min(1,d/p):1,s=t(re(e.checks.safety)+(e.rating==="amber"&&e.amberAck?1:0),a.safetyChecklist.length+(e.rating==="amber"?1:0)),o=t(re(e.checks.tools)+re(e.checks.materials),a.tools.length+a.materials.length),n=t(re(e.checks.prep),a.preparation.length),l=t(re(e.stepsDone),a.steps.length),c=t(re(e.checks.completion),a.completionChecklist.length),i=s*10+o*5+n*10+l*60+c*15;return e.status==="complete"?100:Math.round(i)}function ce(e,a={}){const t=e.length;let s=0,o=0;return e.forEach((n,l)=>{const c=a[l];c&&c.correct!==null&&c.correct!==void 0&&(s+=1,c.correct&&(o+=1))}),{answered:s,correct:o,total:t,pct:t?Math.round(o/t*100):0,complete:s===t}}function $a(e,a){return e.lessonState=e.lessonState||{},e.lessonState[a]||(e.lessonState[a]={answers:{},completed:!1,score:null,extras:[]}),e.lessonState[a]}function tt(e){var s,o;if(!((s=e==null?void 0:e.lessons)!=null&&s.length))return 0;const a=e.lessons.filter(n=>{var l,c;return(c=(l=e.lessonState)==null?void 0:l[n.id])==null?void 0:c.completed}).length/e.lessons.length*85,t=(o=e.final)!=null&&o.passed?15:0;return Math.round(a+t)}function _t(e){return e.lessons.filter(a=>!a.adapted).every(a=>{var t,s;return(s=(t=e.lessonState)==null?void 0:t[a.id])==null?void 0:s.completed})}function zt(e){var s,o,n;const a={},t=(l,c)=>{if(!c||c.correct===null||c.correct===void 0)return;const i=l.topic||"General";a[i]=a[i]||{right:0,total:0},a[i].total+=1,c.correct&&(a[i].right+=1)};for(const l of e.lessons||[]){const c=(s=e.lessonState)==null?void 0:s[l.id];if(c){l.quiz.forEach((i,d)=>t(i,c.answers[d]));for(const i of c.extras||[])(((o=i.data)==null?void 0:o.quiz)||[]).forEach((d,p)=>{var u;return t(d,(u=i.answers)==null?void 0:u[p])})}}return(((n=e.plan)==null?void 0:n.finalAssessment)||[]).forEach((l,c)=>{var i,d;return t(l,(d=(i=e.final)==null?void 0:i.answers)==null?void 0:d[c])}),a}function Re(e){return Object.entries(zt(e)).filter(([,a])=>a.total>0&&a.right/a.total<va).sort((a,t)=>a[1].right/a[1].total-t[1].right/t[1].total).map(([a])=>a)}function wa(e,a=[]){const t=String(e||"").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,""),s=a.map(n=>String(n).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"").trim()).filter(Boolean),o=s.filter(n=>t.includes(n));return{matched:o,total:s.length,likelyCorrect:s.length>0&&o.length>0}}const ka=/^(Gas Safe|NICEIC|NAPIT|OFTEC|HETAS|FENSA|CORGI|NHS|GP|MOT|Citizens Advice|Samaritans|Building Control|the |your |a |an |someone|one )/i;function Ve(e,a="a qualified professional"){let t=String(e||"").trim().replace(/[.\s]+$/,"");return t?ka.test(t)?/^(the|your|a|an) /i.test(t)?t.charAt(0).toLowerCase()+t.slice(1):ft(t):(t=t.split(/\s+/).map((s,o)=>/^[A-Z][a-z]+(?:[-'][A-Za-z]+)?$/.test(s)&&!(o>0&&/^(Safe|Control|Advice|Registered)$/.test(s))?s.toLowerCase():s).join(" "),/s$/i.test(t.split(/\s+|,/)[0])&&!/ss$/i.test(t.split(/\s+|,/)[0])?t:ft(t)):a}function ft(e){if(/^(a|an|the|your) /i.test(e))return e;const a=e.split(/\s+/)[0];return`${/^[aeio]/i.test(a)||/^(u(?!ni|se|ser|su))/i.test(a)||/^(hour|honest|heir)/i.test(a)||/^[A-Z]{2,}$/.test(a)&&/^[AEFHILMNORSX]/.test(a)?"an":"a"} ${e}`}const N=(e,a,t)=>`<circle cx="${e}" cy="${a}" r="${t}"/>`,I=(e,a,t,s)=>`<path d="M${e} ${a}L${t} ${s}"/>`,L=(e,a,t,s,o=0)=>`<rect x="${e}" y="${a}" width="${t}" height="${s}" rx="${o}"/>`,g=e=>`<path d="${e}"/>`,ee=e=>`<path d="${e}" stroke-dasharray="3 3"/>`,yt={tap:{svg:g("M8 92H112")+g("M8 98H112")+g("M52 92V52a8 8 0 0 1 16 0V92")+g("M60 50V40c0-10 8-16 18-16h20v10H80c-4 0-6 3-6 6v10")+g("M54 46L34 34")+N(32,33,3)+ee("M56 98V116M64 98V116")+g("M88 34v6"),anchors:[[98,30,"SPOUT"],[32,33,"LEVER"],[60,110,"FLEXI HOSES"]]},valve:{svg:g("M4 60H44M76 60H116")+g("M4 52H44M76 52H116")+g("M4 68H44M76 68H116")+L(44,46,32,28,4)+N(60,60,9)+I(53,60,67,60)+g("M88 40l10 0-4-4M98 40l-4 4"),anchors:[[60,60,"ISOLATION VALVE"],[96,40,"FLOW"],[20,52,"SUPPLY PIPE"]]},valveOff:{svg:g("M4 52H44M76 52H116")+g("M4 68H44M76 68H116")+L(44,46,32,28,4)+N(60,60,9)+I(60,53,60,67)+g("M44 30a20 20 0 0 1 32 0")+g("M72 26l4 4-6 1"),anchors:[[60,60,"SLOT ACROSS = OFF"],[60,28,"QUARTER TURN"],[20,52,"SUPPLY PIPE"]]},hose:{svg:L(48,8,24,14,2)+g("M56 22c0 20-22 22-22 44s22 22 22 32")+g("M64 22c0 20-22 22-22 44s22 22 22 32")+L(50,98,20,10,2)+g("M54 108v8M66 108v8")+L(44,112,32,6),anchors:[[60,15,"TAP TAIL"],[40,60,"BRAIDED HOSE"],[60,103,"COMPRESSION NUT"]]},nut:{svg:g("M60 22l30 17v34L60 90 30 73V39z")+N(60,56,14)+N(60,56,9)+g("M24 104h72")+g("M30 100v8M90 100v8"),anchors:[[60,56,"THREAD"],[90,39,"HEX NUT"],[60,104,"ACROSS FLATS"]]},spanner:{svg:g("M30 30a16 16 0 1 0 14 24l46 46a6 6 0 0 0 9-9L53 45a16 16 0 0 0-23-15l9 9-3 9-9 3z"),anchors:[[36,36,"JAW"],[80,82,"HANDLE"]]},screwdriver:{svg:L(16,50,40,20,8)+g("M24 50v20M32 50v20M40 50v20")+g("M56 56h40M56 64h40")+g("M96 56l14 4-14 4"),anchors:[[36,60,"HANDLE"],[76,56,"SHAFT"],[106,60,"TIP"]]},bucket:{svg:g("M30 40h60l-8 62H38z")+g("M30 40c0-20 60-20 60 0")+ee("M36 60h48"),anchors:[[60,30,"HANDLE"],[60,60,"WATER LEVEL"]]},towel:{svg:g("M20 40h80v50H20z")+g("M20 52h80M20 78h80")+g("M30 90v10M45 90v10M60 90v10M75 90v10M90 90v10"),anchors:[[60,65,"TOWEL"],[60,100,"CATCH DRIPS"]]},basin:{svg:g("M10 30h100")+g("M16 30c0 30 20 44 44 44s44-14 44-44")+N(60,52,4)+g("M56 74v14c0 10 8 14 16 14h20M64 74v8c0 6 4 10 10 10h18")+g("M92 98v8M92 88v8"),anchors:[[60,52,"PLUG HOLE"],[70,100,"TRAP (U-BEND)"],[100,30,"BASIN RIM"]]},plunger:{svg:I(60,8,60,70)+I(66,8,66,70)+g("M36 96c0-18 12-26 27-26s27 8 27 26z")+g("M30 100h66"),anchors:[[63,30,"HANDLE"],[63,86,"RUBBER CUP"],[92,100,"SEAL OVER PLUG HOLE"]]},wheel:{svg:N(60,60,46)+N(60,60,40)+N(60,60,6)+[0,30,60,90,120,150].map(e=>{const a=e*Math.PI/180;return I(60+6*Math.cos(a),60+6*Math.sin(a),60+40*Math.cos(a),60+40*Math.sin(a))}).join(""),anchors:[[60,60,"HUB"],[100,40,"TYRE"],[80,70,"SPOKES"]]},chain:{svg:N(30,60,20)+N(30,60,4)+N(94,60,12)+N(94,60,3)+g("M30 40L94 48M30 80L94 72")+ee("M30 44L94 51M30 76L94 69"),anchors:[[30,60,"CHAINRING"],[94,60,"SPROCKET"],[62,44,"CHAIN"]]},wall:{svg:L(6,10,50,100)+I(6,30,56,30)+I(6,50,56,50)+I(6,70,56,70)+I(6,90,56,90)+I(30,10,30,30)+I(18,30,18,50)+I(42,30,42,50)+I(30,50,30,70)+I(18,70,18,90)+I(42,70,42,90)+L(56,54,14,8)+g("M70 56h20l8 2-8 2H70")+L(90,48,22,20,3),anchors:[[30,40,"WALL"],[62,58,"WALL PLUG"],[100,58,"DRILL"]]},drill:{svg:g("M20 44h56v22H20z")+g("M76 50h16v10H76")+g("M92 55h22")+g("M30 66l-6 34h22l6-34")+L(26,100,26,10,2),anchors:[[48,55,"MOTOR"],[104,55,"BIT"],[36,86,"GRIP"]]},level:{svg:L(8,48,104,24,4)+L(48,54,24,12,6)+N(60,60,3)+I(56,54,56,66)+I(64,54,64,66),anchors:[[60,60,"BUBBLE CENTRED = LEVEL"],[20,60,"SPIRIT LEVEL"]]},tape:{svg:L(10,40,44,44,8)+N(32,62,8)+g("M54 70h56v10H54")+[62,72,82,92,102].map(e=>I(e,70,e,75)).join(""),anchors:[[32,62,"CASE"],[90,75,"BLADE (mm)"]]},hammer:{svg:g("M30 26h46l10 8-10 8H30z")+L(50,42,10,66,2),anchors:[[40,34,"HEAD"],[55,90,"HANDLE"]]},saw:{svg:g("M10 70h80l10-30H22z")+g("M100 40l14-6v40l-14-4")+Array.from({length:10},(e,a)=>`<path d="M${14+a*8} 70l4 6 4-6"/>`).join(""),anchors:[[56,55,"BLADE"],[108,54,"HANDLE"],[50,76,"TEETH"]]},roller:{svg:L(14,20,70,24,6)+g("M84 32h16v26H56v22")+L(50,80,12,30,3),anchors:[[48,32,"ROLLER SLEEVE"],[56,95,"HANDLE"]]},brush:{svg:g("M44 10h32v40H44z")+g("M44 50h32l-4 12H48z")+L(54,62,12,48,3)+I(52,10,52,50)+I(60,10,60,50)+I(68,10,68,50),anchors:[[60,30,"BRISTLES"],[60,90,"HANDLE"]]},sealant:{svg:L(14,46,64,20,4)+g("M78 50l26 6-26 6")+g("M14 52H4v8h10")+g("M30 66l-4 30h14l4-30")+ee("M100 80c6 4 10 10 12 18"),anchors:[[46,56,"CARTRIDGE"],[100,56,"NOZZLE (45°)"],[108,92,"BEAD"]]},radiator:{svg:L(10,30,100,64,4)+[26,42,58,74,90].map(e=>I(e,34,e,90)).join("")+g("M10 100h-4M110 100h4")+N(104,26,4)+g("M104 22v-8"),anchors:[[104,22,"BLEED VALVE"],[58,60,"PANEL"],[12,100,"VALVE"]]},bulb:{svg:g("M60 14a28 28 0 0 0-16 51c3 3 4 6 4 10h24c0-4 1-7 4-10A28 28 0 0 0 60 14z")+L(48,75,24,16,2)+I(48,81,72,81)+I(48,86,72,86)+g("M52 91l8 8 8-8"),anchors:[[60,40,"GLASS"],[60,83,"CAP (B22/E27)"]]},plug:{svg:L(24,24,72,72,10)+L(52,32,16,10)+L(32,60,12,18)+L(76,60,12,18)+L(44,82,32,8,2)+ee("M60 42v18"),anchors:[[60,37,"EARTH PIN"],[38,69,"NEUTRAL"],[82,69,"LIVE (FUSED)"]]},ladder:{svg:g("M36 112L52 8M84 112L68 8")+[24,44,64,84,100].map(e=>{const a=(112-e)/104;return I(36+16*a,e,84-16*a,e)}).join("")+g("M20 112h80"),anchors:[[60,44,"RUNG"],[40,100,"FEET ON FIRM GROUND"]]},torch:{svg:L(10,50,60,20,4)+g("M70 46h14v28H70z")+ee("M84 46l30-16M84 74l30 16")+L(26,56,10,8,2),anchors:[[40,60,"TORCH"],[104,60,"LIGHT"]]},gloves:{svg:g("M40 104V60l-8-26a4 4 0 0 1 8-2l8 22V22a4 4 0 0 1 8 0v30V16a4 4 0 0 1 8 0v36V20a4 4 0 0 1 8 0v34l6-12a4 4 0 0 1 8 4l-10 28v30z"),anchors:[[60,80,"GLOVES"]]},goggles:{svg:L(14,44,40,30,12)+L(66,44,40,30,12)+g("M54 56h12")+g("M14 58H4M106 58h10"),anchors:[[34,59,"LENS"],[86,59,"SAFETY GLASSES"]]},cloth:{svg:g("M20 30l70-8 10 60-70 10z")+ee("M30 40l60-6M32 56l60-6M34 72l60-6"),anchors:[[60,56,"DAMP CLOTH"]]},key:{svg:N(32,60,16)+N(32,60,6)+g("M48 60h60v10M96 60v10M84 60v8"),anchors:[[32,60,"BOW"],[88,60,"BLADE"]]},clipboard:{svg:L(26,18,68,92,6)+L(46,12,28,12,3)+g("M38 44l5 5 9-10M38 66l5 5 9-10M38 88l5 5 9-10")+I(58,46,84,46)+I(58,68,84,68)+I(58,90,84,90),anchors:[[70,46,"CHECK 1"],[70,68,"CHECK 2"],[70,90,"CHECK 3"]]},drop:{svg:g("M60 14s30 34 30 56a30 30 0 0 1-60 0c0-22 30-56 30-56z")+g("M46 74a14 14 0 0 0 14 14"),anchors:[[60,70,"WATER"]]},toolbox:{svg:L(10,46,100,56,6)+g("M42 46V32h36v14")+I(10,66,110,66)+L(52,60,16,12,2),anchors:[[60,39,"HANDLE"],[60,84,"TOOLBOX"]]},setsquare:{svg:g("M12 108V24l84 84z")+g("M28 92V62l30 30z")+N(92,34,18)+g("M92 16v8M92 44v8M74 34h8M102 34h8")+ee("M12 108L92 34"),anchors:[[30,70,"SET SQUARE"],[92,34,"DATUM"]]},speech:{svg:g("M10 20h64v38H34l-12 12V58H10z")+g("M46 64h64v34H98v12L86 98H46z")+I(20,32,64,32)+I(20,44,52,44)+I(56,76,100,76)+I(56,86,88,86),anchors:[[42,30,"PHRASE"],[80,80,"REPLY"]]},camera:{svg:g("M10 38h22l8-12h40l8 12h22v60H10z")+N(60,66,22)+N(60,66,12)+g("M60 54l6 10-6 14M60 54l-8 8")+L(90,44,12,8,2),anchors:[[60,66,"LENS / APERTURE"],[96,48,"VIEWFINDER"],[60,28,"SHUTTER"]]},timeline:{svg:I(6,60,114,60)+[14,38,62,86,110].map((e,a)=>N(e,60,4)+I(e,a%2?64:56,e,a%2?84:36)).join(""),anchors:[[14,36,"EARLIER"],[110,36,"LATER"],[62,36,"KEY EVENT"]]},chart:{svg:g("M10 10v100h100")+L(22,70,14,40)+L(44,50,14,60)+L(66,34,14,76)+L(88,58,14,52)+ee("M22 64L50 44 72 28 96 52"),anchors:[[73,34,"HIGHEST"],[10,20,"VALUE (£)"],[100,110,"MONTH"]]},book:{svg:g("M60 24c-14-8-34-8-50-4v80c16-4 36-4 50 4 14-8 34-8 50-4V20c-16-4-36-4-50 4z")+I(60,24,60,104)+I(20,40,50,40)+I(20,52,50,52)+I(70,40,100,40)+I(70,52,100,52),anchors:[[34,46,"KEY IDEA"],[86,46,"EXAMPLE"]]},code:{svg:L(8,16,104,88,6)+I(8,30,112,30)+g("M34 52l-12 12 12 12M86 52l12 12-12 12M66 46l-12 36"),anchors:[[60,64,"CODE"],[20,23,"EDITOR"]]},palette:{svg:g("M60 14C32 14 10 34 10 58s20 46 44 46c8 0 10-6 6-12-4-6 0-12 8-12h14c18 0 28-10 28-24 0-24-22-42-50-42z")+N(36,46,6)+N(56,32,6)+N(80,38,6)+N(34,70,6),anchors:[[56,32,"COLOUR"],[70,92,"MIXING AREA"]]},plant:{svg:g("M36 80h48l-6 30H42z")+I(60,80,60,40)+g("M60 56c-18 0-26-12-26-24 16 0 26 10 26 24zM60 46c0-16 10-26 26-26 0 14-8 26-26 26z")+ee("M20 80h80"),anchors:[[34,34,"LEAF"],[60,96,"POT & DRAINAGE"]]},pan:{svg:g("M14 54h72v34a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10z")+g("M86 62h28")+g("M30 44c0-8 6-8 6-16M50 44c0-8 6-8 6-16M70 44c0-8 6-8 6-16"),anchors:[[50,76,"PAN"],[104,62,"HANDLE"]]},scales:{svg:I(60,16,60,104)+I(16,32,104,32)+g("M16 32l-10 30h20zM104 32l-10 30h20z")+g("M6 62a10 6 0 0 0 20 0M94 62a10 6 0 0 0 20 0")+g("M40 104h40"),anchors:[[16,62,"ASSETS"],[104,62,"LIABILITIES"]]}},xa=[[/\b(disconnect|reconnect|connect)\w*\b.*\b(flexi|flexible|hoses?|tails?)\b/i,"hose"],[/\b(isolat\w*|turn (the )?(water )?off|shut ?off|stop ?tap|stopcock)\b/i,"valveOff"],[/\b(restore|turn (the )?(water )?(back )?on|open the valve|reopen)\b/i,"valve"],[/\bvalves?\b/i,"valve"],[/\b(flexi|flexible|hoses?|tails?)\b/i,"hose"],[/\b(nut|back ?nut|bracket|washer|stud|bolt)s?\b/i,"nut"],[/\b(taps?|mixer|spout|monobloc)\b/i,"tap"],[/\b(plunger|plunge)\b/i,"plunger"],[/\b(sink|basin|trap|u-?bend|plug ?hole|drain)\b/i,"basin"],[/\b(bucket)\b/i,"bucket"],[/\b(towel|spill)s?\b/i,"towel"],[/\b(radiator|bleed)\b/i,"radiator"],[/\b(silicone|sealant|caulk|mastic|reseal)\b/i,"sealant"],[/\b(chain|gears?|derailleur|sprocket)\b/i,"chain"],[/\b(wheel|tyre|tire|spoke|inner tube|puncture|bike|bicycle)s?\b/i,"wheel"],[/\b(drill|wall ?plug|rawl)\b/i,"wall"],[/\b(shelf|shelves|bracket|mirror|picture|hang)\b/i,"level"],[/\b(level|spirit)\b/i,"level"],[/\b(measure|tape|mark (out|the))\b/i,"tape"],[/\b(paint|roller|emulsion|undercoat|primer)\b/i,"roller"],[/\b(brush|varnish|stain)\b/i,"brush"],[/\b(saw|cut(ting)? (the )?(wood|timber|board))\b/i,"saw"],[/\b(hammer|nail)s?\b/i,"hammer"],[/\b(screw|screwdriver)s?\b/i,"screwdriver"],[/\b(spanner|wrench|tighten|loosen|undo)\b/i,"spanner"],[/\b(bulb|lamp)\b/i,"bulb"],[/\b(plug|fuse)\b/i,"plug"],[/\b(ladder|step ?ladder)\b/i,"ladder"],[/\b(torch|light(ing)?)\b/i,"torch"],[/\b(gloves?)\b/i,"gloves"],[/\b(goggles|glasses|eye protection)\b/i,"goggles"],[/\b(clean|wipe|cloth|dry)\b/i,"cloth"],[/\b(lock|key)s?\b/i,"key"],[/\b(check|test|inspect|confirm|leak|verify)\w*\b/i,"clipboard"],[/\b(water)\b/i,"drop"]];function je(e,a="setsquare"){const t=String(e||"");for(const[s,o]of xa)if(s.test(t))return o;return a}const Sa=[[/\b(adjustable spanner|spanner|wrench|basin wrench)\b/i,"spanner"],[/\bscrewdriver\b/i,"screwdriver"],[/\bbucket\b/i,"bucket"],[/\b(towel|rag|dust sheet)s?\b/i,"towel"],[/\b(cloth|sponge)\b/i,"cloth"],[/\b(torch|head ?torch|light)\b/i,"torch"],[/\b(gloves?)\b/i,"gloves"],[/\b(goggles|glasses)\b/i,"goggles"],[/\b(tape measure|measure)\b/i,"tape"],[/\b(spirit )?level\b/i,"level"],[/\bdrill\b/i,"drill"],[/\bhammer\b/i,"hammer"],[/\bsaw\b/i,"saw"],[/\b(plunger)\b/i,"plunger"],[/\b(roller)\b/i,"roller"],[/\b(brush)\b/i,"brush"],[/\b(silicone|sealant|caulk)\b/i,"sealant"],[/\b(ladder)\b/i,"ladder"],[/\b(tap|mixer)\b/i,"tap"],[/\b(hoses?|flexi)\b/i,"hose"],[/\b(washer|nut|o-?ring|seal)s?\b/i,"nut"],[/\b(bleed key|radiator key)\b/i,"radiator"],[/\b(pump|tyre lever|inner tube)\b/i,"wheel"],[/\b(chain|lube|oil)\b/i,"chain"],[/\b(bulb)\b/i,"bulb"],[/\b(fuse|plug)\b/i,"plug"],[/\b(key|lock)\b/i,"key"],[/\b(ptfe|tape)\b/i,"tape"]];function Ma(e){const a=String(e||"");for(const[t,s]of Sa)if(t.test(a))return s;return"toolbox"}const M={bg:"#1e4d8c",line:"#ffffff",cyan:"#a8e6ff",grid:"rgba(255,255,255,0.10)",gridMajor:"rgba(255,255,255,0.18)"},F=`font-family="ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace"`;let Ea=0;const at=()=>`bp${Ea+=1}`,V=e=>Ze(String(e??"")),Pe=(e,a=34)=>{const t=String(e||"").toUpperCase().replace(/\s+/g," ").trim();return t.length>a?`${t.slice(0,a-1).trimEnd()}…`:t};function st(e,a=10){return`<defs><pattern id="${e}" width="${a*5}" height="${a*5}" patternUnits="userSpaceOnUse">
    <path d="M${a*5} 0H0V${a*5}" fill="none" stroke="${M.gridMajor}" stroke-width="0.8"/>
    ${[1,2,3,4].map(t=>`<path d="M${t*a} 0V${a*5}M0 ${t*a}H${a*5}" stroke="${M.grid}" stroke-width="0.5"/>`).join("")}
  </pattern></defs>`}function ke({w:e,h:a,body:t,label:s,title:o,fig:n,grid:l=!0,titleBlock:c=!0,cls:i="bp-svg",decorative:d=!1}){const p=at(),u=d?'aria-hidden="true" focusable="false"':`role="img" aria-labelledby="${p}-t"`,v=c?`<g ${F} font-size="7.5" fill="${M.cyan}" stroke="none">
        <rect x="${e-150}" y="${a-30}" width="142" height="22" fill="none" stroke="${M.line}" stroke-width="0.8"/>
        <path d="M${e-150} ${a-19}H${e-8}M${e-46} ${a-30}V${a-8}" stroke="${M.line}" stroke-width="0.6"/>
        <text x="${e-146}" y="${a-22}">${V(Pe(o||"APTO SOLVE",20))}</text>
        <text x="${e-146}" y="${a-11}">NTS · APTO SOLVE</text>
        <text x="${e-42}" y="${a-22}">${V(n||"FIG. 1")}</text>
        <text x="${e-42}" y="${a-11}">REV A</text>
      </g>`:"";return`<svg class="${i}" viewBox="0 0 ${e} ${a}" xmlns="http://www.w3.org/2000/svg" ${u} preserveAspectRatio="xMidYMid meet">
    ${d?"":`<title id="${p}-t">${V(s||o||"Blueprint diagram")}</title>`}
    ${l?st(`${p}-g`):""}
    <rect width="${e}" height="${a}" rx="6" fill="${M.bg}"/>
    ${l?`<rect width="${e}" height="${a}" rx="6" fill="url(#${p}-g)"/>`:""}
    <rect x="4" y="4" width="${e-8}" height="${a-8}" rx="3" fill="none" stroke="${M.line}" stroke-opacity="0.55" stroke-width="0.8"/>
    ${t}
    ${v}
  </svg>`}function xe(e,a,t,s,o=1.6){const n=yt[e]||yt.setsquare,l=s/120,c=n.anchors.map(([d,p,u])=>({x:a+d*l,y:t+p*l,label:u}));return{svg:`<g transform="translate(${a} ${t}) scale(${l})" fill="none" stroke="${M.line}" stroke-width="${o/l}" stroke-linecap="round" stroke-linejoin="round">${n.svg}</g>`,anchors:c}}function Ht(e,{right:a=300,left:t=18,top:s=22,maxLabels:o=3}={}){let n="";return e.slice(0,o).forEach((l,c)=>{const i=s+c*22,d=l.x>(a+t)/2-40||c%2===0,p=d?a:t;n+=`<g stroke="${M.cyan}" stroke-width="0.8" fill="none"><circle cx="${l.x.toFixed(1)}" cy="${l.y.toFixed(1)}" r="2.2" fill="${M.cyan}"/>
      <path d="M${l.x.toFixed(1)} ${l.y.toFixed(1)}L${(d?p-6:p+6).toFixed(1)} ${i}H${p}"/></g>
      <text x="${p+(d?3:-3)}" y="${i+2.5}" ${F} font-size="8" fill="${M.cyan}" text-anchor="${d?"start":"end"}">${V(l.label)}</text>`}),n}function vt(e,a,t){const s=String(e||""),o=n=>`<g fill="none" stroke="${M.cyan}" stroke-width="1.2" stroke-linecap="round"><path d="M${a-16} ${t}a16 16 0 1 ${n?1:0} 32 0"/>
     <path d="M${n?a+16:a-16} ${t}l${n?4:-4} -6M${n?a+16:a-16} ${t}l${n?-5:5} -4"/></g>`;if(/\b(anti-?clockwise|counter-?clockwise|loosen|unscrew|undo)\b/i.test(s)||/\bremov\w*\b.*\b(nuts?|fixings?|screws?|bolts?|backnuts?)\b/i.test(s))return{svg:o(!1),note:"ANTI-CLOCKWISE TO LOOSEN"};if(/\b(clockwise|tighten|screw (in|on)|secure)\b/i.test(s))return{svg:o(!0),note:"CLOCKWISE TO TIGHTEN"};if(/\b(lift|remove|take out|pull)\b/i.test(s))return{svg:`<g fill="none" stroke="${M.cyan}" stroke-width="1.2" stroke-linecap="round"><path d="M${a} ${t+14}V${t-14}M${a-6} ${t-8}L${a} ${t-14}L${a+6} ${t-8}"/></g>`,note:"LIFT / REMOVE"};if(/\b(valve|stop ?tap|stopcock)s?\b/i.test(s)&&/\b(open|close|shut|restore|turn(ed|ing)? (it |them |the \w+ )?(on|off|back on))\b/i.test(s)&&!/\b(disconnect|reconnect|connect)\w*\b/i.test(s)){const n=/\b(open|restore|back on|turn on)\b/i.test(s);return{svg:`<g fill="none" stroke="${M.cyan}" stroke-width="1.2" stroke-linecap="round"><path d="M${a-12} ${t}a12 12 0 0 1 12 -12"/><path d="M${a} ${t-12}l-5 -3M${a} ${t-12}l-4 4"/><path d="M${a-14} ${t+6}H${a+14}" stroke-dasharray="3 3"/></g>`,note:n?"QUARTER TURN: SLOT IN LINE = OPEN":"QUARTER TURN: SLOT ACROSS = OFF"}}return/\b(feed|push|insert|fit|position|place)\b/i.test(s)?{svg:`<g fill="none" stroke="${M.cyan}" stroke-width="1.2" stroke-linecap="round"><path d="M${a} ${t-14}V${t+14}M${a-6} ${t+8}L${a} ${t+14}L${a+6} ${t+8}"/></g>`,note:"FIT / POSITION"}:/\b(check|confirm|inspect|test|look|leak)\w*\b/i.test(s)?{svg:`<g fill="none" stroke="${M.cyan}" stroke-width="1.2"><circle cx="${a-3}" cy="${t-3}" r="9"/><path d="M${a+4} ${t+4}l8 8"/></g>`,note:"INSPECT"}:null}function Aa(e,a,t){const s=`${e.title}. ${e.instruction}`,o=je(e.title)!=="setsquare"?je(e.title):je(s),n=320,l=200,{svg:c,anchors:i}=xe(o,92,34,120),d=vt(e.title,248,140)||vt(`${e.title} ${e.instruction}`,248,140),p=`<g stroke="${M.line}" stroke-width="0.6" fill="none" opacity="0.8"><path d="M92 166H212M92 162v8M212 162v8M96 163l-4 3 4 3M208 163l4 3-4 3"/></g>
    <text x="152" y="162" ${F} font-size="7" fill="${M.cyan}" text-anchor="middle">STEP ${a+1} OF ${t}</text>`,v=`<text x="14" y="20" ${F} font-size="9" fill="${M.line}" letter-spacing="0.6">${V(Pe(`STEP ${String(a+1).padStart(2,"0")} — ${e.title}`,40))}</text>`+c+Ht(i,{right:226,left:86,top:40})+p+(d?d.svg+`<text x="248" y="${d.note.length>16?112:114}" ${F} font-size="6.5" fill="${M.cyan}" text-anchor="middle">${V(d.note)}</text>`:"");return ke({w:n,h:l,body:v,title:e.title,fig:`FIG. ${a+1}`,label:`Blueprint diagram for step ${a+1}: ${e.title}`})}function $t(e){const{svg:a}=xe(Ma(e),6,6,36,1.4),t=at();return`<svg class="bp-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">${st(t,6)}<rect width="48" height="48" rx="8" fill="${M.bg}"/><rect width="48" height="48" rx="8" fill="url(#${t})"/>${a}</svg>`}const Ae=[{id:"red",fill:"#e5484d",sym:"M-5 -5L5 5M5 -5L-5 5",label:"Red"},{id:"amber",fill:"#f5a623",sym:"M0 -6V2M0 5.5V6",label:"Amber"},{id:"green",fill:"#30a46c",sym:"M-5 0L-1.5 4L5 -4",label:"Green"}];function jt(e,{size:a="lg",meaning:t=""}={}){const s=Ae.find(i=>i.id===e)?e:"amber",n=`Suitability rating: ${Ae.find(i=>i.id===s).label}${t?` – ${t}`:""}`;if(a==="sm"){const i=Ae.map((d,p)=>{const u=d.id===s,v=10+p*15;return`<circle cx="${v}" cy="10" r="5.6" fill="${u?d.fill:"none"}" stroke="${u?"#fff":M.cyan}" stroke-opacity="${u?1:.55}" stroke-width="1"/>${u?`<path transform="translate(${v} 10) scale(0.62)" d="${d.sym}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/>`:""}`}).join("");return`<svg class="bp-tl-sm" viewBox="0 0 50 20" role="img" aria-label="${V(n)}"><rect width="50" height="20" rx="10" fill="${M.bg}"/>${i}</svg>`}const l=at(),c=Ae.map((i,d)=>{const p=i.id===s,u=30+d*40;return`<path d="M14 ${u-16}h44" stroke="${M.line}" stroke-width="0.8" fill="none"/>
      ${p?`<circle cx="36" cy="${u}" r="17" fill="${i.fill}" opacity="0.35"/>`:""}
      <circle cx="36" cy="${u}" r="13" fill="${p?i.fill:"none"}" stroke="${p?"#fff":M.cyan}" stroke-width="${p?1.6:1}" stroke-opacity="${p?1:.6}" ${p?"":'stroke-dasharray="2 2"'}/>
      ${p?`<path transform="translate(36 ${u}) scale(1.2)" d="${i.sym}" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/>`:""}
      <text x="64" y="${u+3}" ${F} font-size="7" fill="${p?"#fff":M.cyan}" fill-opacity="${p?1:.7}">${i.label.toUpperCase()}</text>`}).join("");return`<svg class="bp-tl" viewBox="0 0 96 150" role="img" aria-labelledby="${l}-t"><title id="${l}-t">${V(n)}</title>
    ${st(`${l}-g`,6)}<rect width="96" height="150" rx="8" fill="${M.bg}"/><rect width="96" height="150" rx="8" fill="url(#${l}-g)"/>
    <rect x="14" y="8" width="44" height="124" rx="10" fill="none" stroke="${M.line}" stroke-width="1.2"/>
    <path d="M36 132v12M24 144h24" stroke="${M.line}" stroke-width="1" fill="none"/>
    ${c}</svg>`}const wt={emptySaved:{part:"toolbox",title:"No drawings filed yet",note:"DRAWER 01 · EMPTY"},emptyProgress:{part:"chart",title:"Nothing in progress",note:"PLAN PENDING"},done:{part:"clipboard",title:"Job done",note:"ALL CHECKS TICKED"},courseDone:{part:"book",title:"Course complete",note:"ALL LESSONS DONE"},outOfRequests:{part:"clock",title:"Back tomorrow",note:"RESETS AT MIDNIGHT UTC"},notFound:{part:"setsquare",title:"Page not on the drawing",note:"SHEET MISSING"},loading:{part:"setsquare",title:"Drafting",note:"WORK IN PROGRESS"}},qa=`<g fill="none" stroke="${M.line}" stroke-width="1.6" stroke-linecap="round"><circle cx="60" cy="60" r="40"/><circle cx="60" cy="60" r="34" stroke-dasharray="2 6"/><path d="M60 60V34M60 60l18 10"/></g>`;function ot(e,{title:a}={}){const t=wt[e]||wt.loading,s=260,o=150;let n;t.part==="clock"?n=`<g transform="translate(80 18) scale(0.95)">${qa}</g>`:n=xe(t.part,82,16,96).svg;const l=e==="done"||e==="courseDone"?`<g transform="translate(188 30)"><circle r="18" fill="none" stroke="${M.cyan}" stroke-width="1.4"/><circle r="22" fill="none" stroke="${M.cyan}" stroke-width="0.6" stroke-dasharray="2 3"/><path d="M-8 0l5 6 11-12" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>`:"",c=`${n}${l}<text x="16" y="${o-14}" ${F} font-size="8" fill="${M.cyan}">${V(t.note)}</text>`;return ke({w:s,h:o,body:c,titleBlock:!1,label:a||t.title,cls:`bp-svg bp-state bp-${e}`,decorative:!0})}function Ia(){const{svg:e}=xe("setsquare",30,20,100),a=`${e}<path class="bp-draw" d="M150 110 L250 110 L250 40 L200 20 L150 40 Z M150 40 L250 40 M200 20 V110" fill="none" stroke="${M.cyan}" stroke-width="1.4" stroke-linejoin="round"/>
    <text x="150" y="128" ${F} font-size="7.5" fill="${M.cyan}">DRAFTING YOUR PLAN…</text>`;return ke({w:280,h:150,body:a,titleBlock:!1,decorative:!0,cls:"bp-svg bp-loader"})}function La(e,a,t){const s=["A","B","C","D"],i={budget:[["Item","Budget £","Spent £","Left £"],["Rent","750","750","=B2-C2"],["Food","220","180","=B3-C3"],["Travel","90","64","=B4-C4"],["Total","=SUM(B2:B4)","",""]],sum:[["Month","Spend £","",""],["Jan","120","",""],["Feb","95","",""],["Mar","140","",""],["Total","=SUM(B2:B4)","",""]],formula:[["Item","Price £","Qty","Cost £"],["Milk","1.45","2","=B2*C2"],["Bread","1.20","1","=B3*C3"],["Eggs","2.10","1","=B4*C4"],["","","",""]],format:[["Date","Item","Amount",""],["01/09/2026","Bus pass","£45.00",""],["03/09/2026","Lunch","£6.50",""],["","","",""],["","","",""]],basic:[["","","",""],["","","",""],["","B3","",""],["","","",""],["","","",""]]}[e],d={budget:[4,1],sum:[4,1],formula:[1,3],format:[0,0],basic:[2,1]}[e],p=i[d[0]][d[1]];let u=`<g stroke="${M.line}" stroke-width="0.8" fill="none">`;u+=`<rect x="18" y="18" width="246" height="14"/><text x="22" y="28" ${F} font-size="7" fill="${M.cyan}" stroke="none">fx</text>
        <text x="40" y="28" ${F} font-size="7.5" fill="#fff" stroke="none">${V(String(p).startsWith("=")?p:e==="basic"?"":p)}</text>`,s.forEach((h,w)=>{u+=`<rect x="${40+w*56}" y="36" width="56" height="14"/><text x="${40+w*56+56/2}" y="46" ${F} font-size="7.5" fill="${M.cyan}" stroke="none" text-anchor="middle">${h}</text>`});for(let h=0;h<5;h++)u+=`<rect x="18" y="${52+h*18}" width="22" height="18"/><text x="29" y="${52+h*18+12}" ${F} font-size="7.5" fill="${M.cyan}" stroke="none" text-anchor="middle">${h+1}</text>`,s.forEach((w,A)=>{const k=h===d[0]&&A===d[1],S=i[h][A];u+=`<rect x="${40+A*56}" y="${52+h*18}" width="56" height="18" ${k?`stroke="${M.cyan}" stroke-width="2"`:""}/>`,S&&(u+=`<text x="${40+A*56+4}" y="${52+h*18+12}" ${F} font-size="7" fill="#fff" stroke="none" ${h===0&&e!=="basic"?'font-weight="700"':""}>${V(S.length>12?S.slice(0,11)+"…":S)}</text>`)});u+="</g>";const v=40+d[1]*56+56,$=52+d[0]*18+18/2,b={budget:"TOTAL USES SUM()",sum:"SUM OF A RANGE",formula:"FORMULA STARTS WITH =",format:"HEADER ROW",basic:"CELL B3 = COLUMN B, ROW 3"}[e];return u+=`<g stroke="${M.cyan}" stroke-width="0.8" fill="none"><circle cx="${v}" cy="${$}" r="2" fill="${M.cyan}"/><path d="M${v} ${$}L280 ${Math.max(40,$-20)}H286"/></g>
        <text x="288" y="${Math.max(40,$-20)+2.5}" ${F} font-size="7" fill="${M.cyan}">${V(b)}</text>
        <text x="18" y="156" ${F} font-size="7" fill="${M.cyan}">COLUMNS = LETTERS · ROWS = NUMBERS</text>`,ke({w:400,h:200,body:u,title:a,fig:`FIG. ${t+1}`,label:`Blueprint diagram: labelled spreadsheet grid for “${a}”`})}const Ta=[[/\b(excel|spreadsheet|google sheets|cells?|formula|vlookup|pivot)\b/i,"sheet"],[/\b(spanish|italian|french|german|portuguese|welsh|gaelic|japanese|mandarin|arabic|language|phrases?|conversation\w*|vocabulary|grammar|pronunciation)\b/i,"speech"],[/\b(photo\w*|camera|aperture|shutter|exposure|composition)\b/i,"camera"],[/\b(history|historical|century|tudor|victorian|roman|war|empire|monarch\w*|kings?|queens?)\b/i,"timeline"],[/\b(budget\w*|money|finance|saving\w*|pension|tax|interest|statistics|data|chart)\b/i,"chart"],[/\b(account\w*|bookkeeping|balance sheet)\b/i,"scales"],[/\b(python|javascript|coding|programming|html|css|code)\b/i,"code"],[/\b(paint\w*|drawing|sketch\w*|art|colour theory|watercolour)\b/i,"palette"],[/\b(garden\w*|plants?|grow\w*|allotment|seeds?)\b/i,"plant"],[/\b(cook\w*|bak\w*|recipe|kitchen|bread|meal)\b/i,"pan"]];function Ra(e,a,t){const s=`${e.title} ${e.request||""} ${a.title}`;let o="book";for(const[d,p]of Ta)if(d.test(s)){o=p;break}if(o==="sheet"){const d=a.title,p=/budget/i.test(d)?"budget":/\bsum\b|total|function/i.test(d)?"sum":/formula|calculat/i.test(d)?"formula":/format|enter|data/i.test(d)?"format":"basic";return La(p,a.title,t)}const{svg:n,anchors:l}=xe(o,130,34,120),c=`<text x="14" y="20" ${F} font-size="9" fill="${M.line}" letter-spacing="0.6">${V(Pe(`LESSON ${t+1} — ${a.title}`,52))}</text>`,i=(a.keyPoints||[]).slice(0,3).map((d,p)=>`<text x="16" y="${70+p*20}" ${F} font-size="7" fill="${M.cyan}">${p+1}. ${V(Pe(d,24))}</text>`).join("");return ke({w:400,h:200,body:c+n+Ht(l,{right:262,left:124,top:44})+i,title:a.title,fig:`FIG. ${t+1}`,label:`Blueprint diagram for lesson ${t+1}: ${a.title}`})}class ne extends Error{}const Pa=/\.(jpe?g|png|webp)$/i;function Ca(e){if(!e)throw new ne("No file selected.");if(!(ca.includes(e.type)||!e.type&&Pa.test(e.name)))throw new ne(`“${e.name}” is not supported. Please choose a JPG, PNG or WebP photo.`);if(e.size>H.MAX_RAW_IMAGE_BYTES)throw new ne(`“${e.name}” is too large (${(e.size/1048576).toFixed(1)} MB). Please choose a photo under ${H.MAX_RAW_IMAGE_BYTES/1048576} MB.`)}function Na(e){return new Promise((a,t)=>{const s=URL.createObjectURL(e),o=new Image;o.onload=()=>{URL.revokeObjectURL(s),a(o)},o.onerror=()=>{URL.revokeObjectURL(s),t(new ne(`“${e.name}” could not be opened. It may be damaged or not a real image.`))},o.src=s})}function Da(e,a,t){return new Promise(s=>e.toBlob(s,a,t))}function Oa(e){return new Promise((a,t)=>{const s=new FileReader;s.onload=()=>a(String(s.result).split(",")[1]),s.onerror=()=>t(new ne("Could not read the compressed photo.")),s.readAsDataURL(e)})}async function _a(e){Ca(e);const a=await Na(e);let t=H.IMAGE_MAX_EDGE_PX,s=.82;for(let o=0;o<6;o++){const n=Math.min(1,t/Math.max(a.naturalWidth,a.naturalHeight)),l=Math.max(1,Math.round(a.naturalWidth*n)),c=Math.max(1,Math.round(a.naturalHeight*n)),i=document.createElement("canvas");i.width=l,i.height=c;const d=i.getContext("2d");d.fillStyle="#ffffff",d.fillRect(0,0,l,c),d.drawImage(a,0,0,l,c);const p=await Da(i,"image/jpeg",s);if(!p)throw new ne("Your browser could not process this photo.");if(p.size<=H.MAX_UPLOAD_IMAGE_BYTES)return{id:Math.random().toString(36).slice(2,10),name:e.name,mimeType:"image/jpeg",data:await Oa(p),previewUrl:URL.createObjectURL(p),width:l,height:c,bytes:p.size,originalBytes:e.size};s=Math.max(.5,s-.1),t=Math.round(t*.8)}throw new ne(`“${e.name}” could not be made small enough to send. Please try a different photo.`)}function za(e){return e<1024?`${e} B`:e<1048576?`${Math.round(e/1024)} KB`:`${(e/1048576).toFixed(1)} MB`}const nt=e=>e.map(a=>({mimeType:a.mimeType,data:a.data}));function ve(e){e.forEach(a=>a.previewUrl&&URL.revokeObjectURL(a.previewUrl))}const rt="APTO Solve provides educational guidance only. It cannot inspect, certify or guarantee any completed work. If anything differs from the guidance, or you are unsure, stop and ask a qualified professional.";function _e({title:e,body:a,actions:t=[{label:"Close",value:null,variant:"primary"}],dismissValue:s=null}){return new Promise(o=>{const n=document.getElementById("modal-root"),l=document.activeElement,c=`modal-${Math.random().toString(36).slice(2,8)}`,i=document.createElement("div");i.className="modal-backdrop",j(i,r` <div
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="${c}-title"
          tabindex="-1"
        >
          <h2 id="${c}-title">${e}</h2>
          <div class="modal-body">${a}</div>
          <div class="btn-row end">
            ${t.map((b,h)=>r`<button type="button" class="btn ${b.variant?`btn-${b.variant}`:""}" data-index="${h}">${b.label}</button>`)}
          </div>
        </div>`),n.appendChild(i);const d=i.querySelector(".modal"),p=[document.querySelector(".site-header"),document.getElementById("main"),document.querySelector(".site-footer")];p.forEach(b=>b&&(b.inert=!0));const u=b=>{const h=typeof b=="function"?b(d):b;p.forEach(w=>w&&(w.inert=!1)),i.remove(),document.removeEventListener("keydown",$,!0),l&&document.contains(l)&&l.focus(),o(h)},v=()=>[...d.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])')],$=b=>{if(b.key==="Escape"&&(b.preventDefault(),u(s)),b.key==="Tab"){const h=v();if(!h.length)return;const w=h[0],A=h[h.length-1];b.shiftKey&&document.activeElement===w?(b.preventDefault(),A.focus()):!b.shiftKey&&document.activeElement===A&&(b.preventDefault(),w.focus())}};document.addEventListener("keydown",$,!0),i.addEventListener("click",b=>{b.target===i&&u(s),b.target.closest("a[data-link]")&&u(s);const h=b.target.closest("button[data-index]");h&&u(t[Number(h.dataset.index)].value)}),(d.querySelector(".btn-primary")||v()[0]||d).focus()})}function ae(e,a){var o,n;const t=document.activeElement;let s=null;t&&e.contains(t)&&(t.id?s=`#${CSS.escape(t.id)}`:(o=t.dataset)!=null&&o.focus&&(s=`[data-focus="${CSS.escape(t.dataset.focus)}"]`)),a(),s&&((n=e.querySelector(s))==null||n.focus({preventScroll:!0}))}function kt(e,a,t="Confirm",s="primary"){return _e({title:e,body:r`<p>${a}</p>`,actions:[{label:"Cancel",value:!1},{label:t,value:!0,variant:s}],dismissValue:!1})}async function it(){var a;if((a=R.state.consent)!=null&&a.photos)return!0;const e=await _e({title:"Send photos for analysis?",body:r` <p>
        Your photos will be sent to <strong>Google Gemini</strong> so the AI can
        look at them and tailor its guidance.
      </p>
      <ul>
        <li>
          APTO Solve does not intentionally keep your photos – they are not
          saved on our servers or in your browser.
        </li>
        <li>
          On the free Gemini service, Google may use submitted content to
          improve its products. See our
          <a href="/solve/privacy" data-link>privacy information</a>.
        </li>
        <li>
          <strong
            >Please do not include faces, addresses, documents, number plates or
            anything personal.</strong
          >
        </li>
        <li>
          The AI can only see what is in the picture. It cannot confirm that
          anything is safe or correctly installed.
        </li>
      </ul>`,actions:[{label:"Not now",value:!1},{label:"I understand – send photos",value:!0,variant:"primary"}],dismissValue:!1});return e&&R.update(t=>{t.consent={...t.consent,photos:!0}}),e}function W(e,a="info",t=4500){const s=document.getElementById("toast-region");if(!s)return;const o=document.createElement("div");o.className=`toast ${a==="error"?"error":""}`,o.textContent=e,s.appendChild(o),setTimeout(()=>o.remove(),t)}const xt={assess:["Reading your request…","Checking safety…","Working out what to ask you…"],practical_plan:["Checking safety first…","Listing tools and materials…","Breaking the job into small steps…","Adding checkpoints and troubleshooting…"],course_plan:["Designing your learning objective…","Planning the roadmap…","Writing five short lessons…","Creating quiz questions…","Nearly there – courses take a little longer…"],adapt_course:["Looking at your quiz results…","Focusing on your weak areas…","Writing new lessons…"],default:["Thinking…","Putting together a clear answer…"]},Ha={course_plan:[{label:"Safety check",at:0},{label:"Course outline",at:4},{label:"Lessons and quizzes",at:12}],practical_plan:[{label:"Safety check",at:0},{label:"Tools and preparation",at:4},{label:"Steps and checkpoints",at:10}],adapt_course:[{label:"Reading your quiz results",at:0},{label:"New lessons",at:5}]},St={course_plan:["Tip: short, regular sessions beat one long one – 15 minutes a day works well.","Tip: quizzes you already have never use your free requests.","Tip: get a topic wrong? It is highlighted so you can adapt the next lessons.","Tip: pass the final assessment (70%) to print your certificate."],practical_plan:["Tip: find your main stopcock before you start any plumbing job.","Tip: lay a towel and a bucket under the work area to catch drips.","Tip: take a photo before you take anything apart – it helps with reassembly.","Tip: if anything looks different from the guide, stop and ask."],default:["Tip: everything you create is saved on this device only.","Tip: you can come back to any step or lesson from My learning."]};function Bt(e,a,t){var b,h,w;const s=xt[a]||xt.default,o=Ha[a],n=St[a]||St.default,l=Date.now(),c=A=>o?r`<ol class="bp-stages" aria-label="Progress">
          ${o.map((k,S)=>{const q=o[S+1],B=q&&A>=q.at?"done":A>=k.at?"active":"todo";return r`<li class="${B}">
              <span class="bp-stage-dot" aria-hidden="true"
                >${B==="done"?f("check"):S+1}</span
              >
              <span
                >${k.label}<span class="visually-hidden"
                  >${B==="done"?" – done":B==="active"?" – in progress":""}</span
                ></span
              >
            </li>`})}
        </ol>`:"";j(e,r` <div class="card loading-card" role="status" aria-live="polite">
      <div class="bp-figure loading-figure">${T(Ia())}</div>
      <h2 class="loading-line">${s[0]}</h2>
      <div class="stage-slot">${c(0)}</div>
      <p class="muted">
        This usually takes 5–30 seconds. <span class="elapsed">0s</span>
      </p>
      <p class="loading-tip small">${n[0]}</p>
      ${t?r`<button type="button" class="btn btn-ghost" data-cancel>Cancel</button>`:""}
    </div>`);const i=e.querySelector(".loading-line"),d=e.querySelector(".elapsed"),p=e.querySelector(".stage-slot"),u=e.querySelector(".loading-tip");let v=0;const $=setInterval(()=>{const A=Math.round((Date.now()-l)/1e3);d.textContent=`${A}s`,A%4===0&&(v=Math.min(v+1,s.length-1),i.textContent=s[v]),o&&j(p,c(A)),A%6===0&&(u.textContent=n[A/6%n.length])},1e3);return(b=e.querySelector("[data-cancel]"))==null||b.addEventListener("click",()=>t()),(w=(h=e.querySelector(".loading-card"))==null?void 0:h.focus)==null||w.call(h),()=>clearInterval($)}function lt(e,a="Working…"){if(!e)return()=>{};const t=e.innerHTML;return e.disabled=!0,e.setAttribute("aria-busy","true"),e.innerHTML=`<span class="spinner" aria-hidden="true"></span><span>${a}</span>`,()=>{document.contains(e)&&(e.disabled=!1,e.removeAttribute("aria-busy"),e.innerHTML=t)}}const Ce={green:{label:"Green",meaning:"Generally suitable for a capable beginner."},amber:{label:"Amber",meaning:"Caution required – professional help may be sensible."},red:{label:"Red",meaning:"Do not continue – use a qualified professional."}},le=e=>{var a,t;return r`<span class="rating-tl ${e}"
    >${T(jt(e,{size:"sm",meaning:((a=Ce[e])==null?void 0:a.meaning)||""}))}<span
      class="rating-word"
      aria-hidden="true"
      >${((t=Ce[e])==null?void 0:t.label)||e}</span
    ></span
  >`};function Ut(e,a){const t=Ce[e]||Ce.amber;return r` <div class="rating-panel bp-rating ${e}">
    ${T(jt(e,{meaning:t.meaning}))}
    <div>
      <p class="rating-title"><strong>${t.label}:</strong> ${t.meaning}</p>
      ${a?r`<p class="mb-0">${a}</p>`:""}
      <p class="small muted mb-0">
        This rating is a guide based on what you told us – it is not an
        inspection.
      </p>
    </div>
  </div>`}function U(e,a,t,s){const o=s||{info:"info",green:"checkCircle",amber:"alert",red:"stop"}[e]||"info";return r`<div class="notice ${e}">
    ${f(o)}
    <div>${a?r`<h3>${a}</h3>`:""}${t}</div>
  </div>`}function ct(e){return U("red","Something went wrong",r`<p>${(e==null?void 0:e.message)||"Please try again."}</p>`)}function Ye({observations:e=[],assumptions:a=[],uncertainties:t=[]}){return!e.length&&!a.length&&!t.length?"":r` <div class="oau">
        ${e.length?r`<section>
                <h3>${f("eye")} What can be seen</h3>
                <ul>
                  ${Z(e)}
                </ul>
              </section>`:""}
        ${a.length?r`<section>
                <h3>${f("lightbulb")} Assumptions</h3>
                <ul>
                  ${Z(a)}
                </ul>
              </section>`:""}
        ${t.length?r`<section>
                <h3>${f("help")} Not certain</h3>
                <ul>
                  ${Z(t)}
                </ul>
              </section>`:""}
      </div>`}function ja(e){var a,t;return r` <article class="card" aria-labelledby="refusal-title">
    <div class="flex mb-2">
      ${le("red")}<span class="small muted">Safety decision</span>
    </div>
    <h1 id="refusal-title" tabindex="-1">
      ${e.title||"This needs a qualified professional"}
    </h1>
    ${e.request?r`<p class="muted">You asked: “${e.request}”</p>`:""}
    ${e.emergency?U("red","If this is an emergency",r`<p>${e.emergency}</p>`,"alert"):""}
    ${U("amber","Why APTO Solve will not give step-by-step instructions",r`<p>${e.risk}</p>`,"stop")}
    <section class="mb-2">
      <h2>Who to contact</h2>
      <p>
        Please contact <strong>${Ve(e.professional)}</strong>.
      </p>
    </section>
    ${(a=e.safePreparation)!=null&&a.length?r`<section class="mb-2">
            <h2>What you can safely do now</h2>
            <ul>
              ${Z(e.safePreparation)}
            </ul>
          </section>`:""}
    ${(t=e.questionsForProfessional)!=null&&t.length?r`<section class="mb-2">
            <h2>Questions to ask the professional</h2>
            <ul>
              ${Z(e.questionsForProfessional)}
            </ul>
          </section>`:""}
    <p class="small muted">
      APTO Solve provides educational guidance only and cannot inspect, certify
      or guarantee any work.
    </p>
    <div class="btn-row no-print">
      <a class="btn btn-primary" href="/solve/" data-link
        >${f("arrowLeft")} Learn something else</a
      >
      <a class="btn" href="/solve/safety" data-link>Read our safety information</a>
    </div>
  </article>`}function dt(e,a,{max:t=H.MAX_IMAGES_PER_REQUEST,label:s="Add photos (optional)",hint:o="",onChange:n=()=>{}}={}){const l=`photo-${Math.random().toString(36).slice(2,8)}`;let c=-1,i="",d=!1;const p=()=>{j(e,r` <div class="field">
          <span class="label" id="${l}-label">${s}</span>
          ${o?r`<p class="hint">${o}</p>`:""}
          <label
            class="dropzone"
            for="${l}"
            ${a.length>=t?T("hidden"):""}
          >
            <input
              id="${l}"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              ${t>1?T("multiple"):""}
              aria-describedby="${l}-help"
            />
            ${f("camera")}
            <span
              ><strong
                >${d?"Preparing photo…":"Choose or take a photo"}</strong
              ></span
            >
            <span class="small muted" id="${l}-help"
              >JPG, PNG or WebP · up to ${t} photo${t>1?"s":""} · large
              photos are compressed on your device</span
            >
          </label>
          ${i?r`<p class="field-error" role="alert">${f("alert")}<span>${i}</span></p>`:""}
          ${a.length?r` <ul class="previews" aria-label="Selected photos">
                    ${a.map(($,b)=>r` <li>
                          <img
                            src="${$.previewUrl}"
                            alt="Preview of photo ${b+1}: ${$.name}"
                          />
                          <div class="meta">
                            ${za($.bytes)} · ${$.width}×${$.height}
                          </div>
                          <div class="preview-actions">
                            <button type="button" data-replace="${b}">
                              Replace<span class="visually-hidden">
                                photo ${b+1}</span
                              >
                            </button>
                            <button type="button" data-remove="${b}">
                              Remove<span class="visually-hidden">
                                photo ${b+1}</span
                              >
                            </button>
                          </div>
                        </li>`)}
                  </ul>
                  <p class="hint">
                    ${f("lock","icon-inline")} Photos are only sent to
                    Google Gemini when you continue, and are not saved.
                  </p>`:""}
        </div>`)},u=async $=>{i="";const b=[...$];if(b.length){d=!0,p();try{for(const h of b){if(c<0&&a.length>=t){i=`You can add up to ${t} photo${t>1?"s":""}.`;break}try{const w=await _a(h);c>=0?(ve([a[c]]),a[c]=w,c=-1):a.push(w)}catch(w){i=w instanceof ne?w.message:"That photo could not be processed. Please try another."}}}finally{d=!1,c=-1,p(),n(a)}}};e.addEventListener("change",$=>{$.target.matches("input[type=file]")&&(u($.target.files),$.target.value="")}),e.addEventListener("click",$=>{var w;const b=$.target.closest("[data-remove]"),h=$.target.closest("[data-replace]");if(b){const A=Number(b.dataset.remove);ve(a.splice(A,1)),i="",p(),n(a),(w=e.querySelector("input[type=file]"))==null||w.focus()}if(h){c=Number(h.dataset.replace);const A=document.createElement("input");A.type="file",A.accept="image/jpeg,image/png,image/webp",A.addEventListener("change",()=>u(A.files)),A.click()}});const v=$=>{const b=e.querySelector(".dropzone");b&&($.type==="dragover"&&($.preventDefault(),b.classList.add("drag")),$.type==="dragleave"&&b.classList.remove("drag"),$.type==="drop"&&($.preventDefault(),b.classList.remove("drag"),u($.dataTransfer.files)))};return["dragover","dragleave","drop"].forEach($=>e.addEventListener($,v)),p(),{render:p,addFiles:u}}function ge(e,a){const t=Math.max(0,Math.min(100,Math.round(e)));return r` <div>
    ${a?r`<div class="progress-label"><span>${a}</span><span>${t}%</span></div>`:""}
    <div
      class="progress"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="${t}"
      aria-label="${a||"Progress"}"
    >
      <span style="width:${t}%"></span>
    </div>
  </div>`}function Ne(e){try{return new Date(e).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}catch{return""}}function ut({compact:e=!1}={}){return r`<div
    class="notice info out-of-requests"
    id="out-of-requests"
    tabindex="-1"
    role="status"
  >
    ${f("clock")}
    <div>
      <h3>You’re out of free requests today</h3>
      <p class="mb-0">
        You’ve used all ${G} free AI requests. They reset at
        <strong>${Je()}</strong
        >.${e?"":r` Everything you’ve saved still works – steps, lessons and quizzes you already have don’t use requests. <a href="/solve/saved" data-link>Go to My learning</a>.`}
      </p>
    </div>
  </div>`}function Ba(e){j(e,r` <div class="narrow">
      <p class="eyebrow">Safety information</p>
      <h1>How APTO Solve keeps you safe</h1>
      <p class="lead">${rt}</p>
      ${U("red","Emergencies",r`<ul class="mb-0">
          <li>
            If anyone is in immediate danger, call <strong>999</strong> (or
            112).
          </li>
          <li>
            If you smell gas, call the National Gas Emergency Service on
            <strong>0800 111 999</strong>. Do not use switches or naked flames,
            open windows and leave the property.
          </li>
          <li>
            For a power cut or damaged power lines, call <strong>105</strong>.
          </li>
          <li>
            For urgent medical advice that is not an emergency, contact
            <strong>NHS 111</strong>.
          </li>
        </ul>`,"alert")}

      <section class="card">
        <h2>Suitability ratings</h2>
        <ul class="item-list">
          <li>
            ${le("green")} Generally suitable for a capable beginner.
          </li>
          <li>
            ${le("amber")} Caution required – professional assistance
            may be sensible. You must confirm you understand before the steps
            unlock.
          </li>
          <li>
            ${le("red")} Do not continue – use a qualified
            professional. No step-by-step instructions are given.
          </li>
        </ul>
        <p class="mt-2 mb-0">
          Ratings are based on what you tell us and any photos. A photograph
          cannot show hidden damage, and it can never prove that work is safe or
          compliant.
        </p>
      </section>

      <section class="card">
        <h2>Jobs we will not guide</h2>
        <p>
          Requests in these areas are blocked before they reach the AI, and AI
          responses are checked again before they are shown. Instead, we explain
          the risk, suggest the right professional and give safe preparation
          tips.
        </p>
        <ul>
          ${Z(Le.map(a=>a.label))}
        </ul>
        <p class="mb-0">
          We also refuse any task where incorrect guidance could reasonably
          cause serious injury.
        </p>
      </section>

      <section class="card">
        <h2>Always stop if…</h2>
        <ul class="mb-0">
          <li>
            an isolation valve, stop tap or switch does not fully isolate the
            water or power;
          </li>
          <li>fittings are badly corroded, seized or crumble;</li>
          <li>
            you find hidden damage, rot, mould, scorching or existing leaks;
          </li>
          <li>anything differs materially from the instructions;</li>
          <li>you feel unsure, unwell or out of your depth.</li>
        </ul>
      </section>

      <section class="card soft">
        <h2>How the safety system works</h2>
        <ol class="mb-0">
          <li>
            Your request is screened in your browser and again on our server
            using safety categories that do not depend on the AI.
          </li>
          <li>
            The AI is given strict safety instructions and must label what it
            observes, assumes and cannot tell.
          </li>
          <li>
            The AI’s answer is checked for dangerous instructions before it is
            displayed.
          </li>
          <li>
            Practical guides show stop conditions, checkpoints and a final
            testing checklist.
          </li>
        </ol>
      </section>
    </div>`)}function Ua(e){j(e,r` <div class="narrow">
      <p class="eyebrow">Privacy information</p>
      <h1>Your privacy</h1>
      <p class="lead">
        A plain-English summary of what happens to your information when you use
        APTO Solve.
      </p>

      <section class="card">
        <ul class="mb-0">
          <li>
            <strong>No account is required.</strong> We do not ask for your
            name, email address or password.
          </li>
          <li>
            <strong>Your progress is stored locally</strong> in this browser
            (localStorage). It is not uploaded to an APTO Solve database.
            Clearing your browser data, or using “Delete all saved learning”,
            removes it.
          </li>
          <li>
            <strong>Learning requests are sent to Google Gemini</strong> for
            processing, together with your answers to personalisation questions
            and any help requests.
          </li>
          <li>
            <strong
              >Photos you choose to upload are sent to Google Gemini</strong
            >
            for analysis. We ask for your confirmation before the first photo is
            sent. Photos are compressed on your device (which also removes
            location data stored in the file) and are not intentionally retained
            by APTO Solve – they are not saved on our servers or in your
            browser.
          </li>
          <li>
            <strong
              >Free-tier data handling may differ from paid-tier
              handling.</strong
            >
            On Google’s free Gemini API tier, Google may use submitted content
            to improve its products. Please review Google’s own terms for
            details.
          </li>
          <li>
            <strong>Please do not upload</strong> faces, addresses, personal
            documents, number plates or anything else sensitive, and do not type
            personal details into your requests.
          </li>
          <li>
            To apply the free daily limit (${G} requests), your
            browser stores a random anonymous identifier, and our server briefly
            keeps request counts in memory. Your IP address is used only for
            basic abuse prevention and is not stored in a database.
          </li>
          <li>
            Our hosting provider (Netlify) may keep standard technical logs. We
            do not log the content of your requests.
          </li>
        </ul>
      </section>
      ${U("info","No legal guarantees",r`<p class="mb-0">This summary describes how the app is designed to work. It is not a legal statement of compliance with any particular data-protection law.</p>`)}
    </div>`)}function Fa(e){j(e,r` <div class="narrow">
      <p class="eyebrow">How it works</p>
      <h1>Learning with APTO Solve</h1>
      <section class="card">
        <h2>${f("wrench","icon-inline")} Practical tasks</h2>
        <p>
          For hands-on jobs like changing a tap or unblocking a sink you get a
          suitability rating, a safety checklist, tools and materials,
          preparation (including isolating water or power), and then one step at
          a time with checkpoints. Help buttons explain things more simply, give
          another example, help when you are stuck, or look at a progress photo.
        </p>
      </section>
      <section class="card">
        <h2>${f("book","icon-inline")} Courses</h2>
        <p>
          For subjects like Italian, photography or Excel you get a personalised
          objective, a roadmap and five short lessons with worked examples and
          quizzes. Your quiz results highlight weak areas, and you can ask APTO
          Solve to adapt your next lessons. Pass the final assessment to print a
          completion certificate.
        </p>
      </section>
      <section class="card">
        <h2>${f("chart","icon-inline")} Free daily allowance</h2>
        <p class="mb-0">
          Each AI action (starting a request, building a guide or course, or
          asking for extra help) uses one of your ${G} free daily
          requests. Working through steps, lessons and quizzes you already have
          is free. The service is not unlimited.
        </p>
      </section>
      <a class="btn btn-primary" href="/solve/" data-link>Start learning</a>
    </div>`)}function fe(e){j(e,r` <div class="not-found narrow">
      <img
        class="nf-mascot"
        src="/solve/mascot.webp"
        width="511"
        height="480"
        alt=""
      />
      <h1>We couldn’t find that page</h1>
      <p class="lead" style="margin-inline:auto">
        The link may be out of date, or the item may have been deleted from this
        browser. Saved learning only exists on the device and browser where you
        created it.
      </p>
      <div class="btn-row" style="justify-content:center">
        <a class="btn btn-primary" href="/solve/" data-link>Go to the homepage</a>
        <a class="btn" href="/solve/saved" data-link>View my learning</a>
      </div>
    </div>`)}const ze=e=>{const a=R.getItem(e);return a&&a.kind==="course"?a:null};async function Ft(e){e instanceof K&&e.code.startsWith("DAILY_LIMIT")?W(e.message,"info",8e3):W(e.message||"Something went wrong.","error")}function Ga(e,{id:a}){const t=ze(a);if(!t)return fe(e);me(t.title);const s=new AbortController;let o=null;const n=()=>{var u,v,$,b,h,w,A;const l=Re(t),c=t.lessons.filter(k=>{var S,q;return(q=(S=t.lessonState)==null?void 0:S[k.id])==null?void 0:q.completed}).length,i=_t(t),d=t.lessons.findIndex(k=>{var S,q;return!((q=(S=t.lessonState)==null?void 0:S[k.id])!=null&&q.completed)}),p=t.lessons.reduce((k,S)=>k+(S.minutes||0),0);j(e,r` <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/solve/saved" data-link
            >${f("arrowLeft","icon-inline")} My learning</a
          >
        </nav>
        <header class="mb-2">
          <p class="eyebrow">Course · ${t.plan.level}</p>
          <h1>${t.title}</h1>
          <p class="lead">${t.plan.objective}</p>
          <div class="flex mb-2">
            <span class="badge primary">${t.lessons.length} lessons</span
            ><span class="badge"
              >${f("clock","icon-inline")} about ${p} minutes</span
            >${(u=t.final)!=null&&u.passed?r`<span class="badge green">${f("award","icon-inline")} Certificate earned</span>`:""}
          </div>
          ${ge(tt(t),"Course progress")}
        </header>

        <div class="btn-row mb-2">
          ${d>=0?r`<a class="btn btn-primary btn-lg" href="/solve/course/${t.id}/lesson/${d+1}" data-link>${f("play")} ${c?"Continue":"Start"}: lesson ${d+1}</a>`:r`<a class="btn btn-primary btn-lg" href="/solve/course/${t.id}/final" data-link>${f("target")} ${(v=t.final)!=null&&v.passed?"Review final assessment":"Take the final assessment"}</a>`}
        </div>

        <div class="grid grid-2">
          <section class="card" aria-labelledby="lessons-title">
            <h2 id="lessons-title">Lessons</h2>
            <ol class="lesson-list" role="list">
              ${t.lessons.map((k,S)=>{var de;const q=(de=t.lessonState)==null?void 0:de[k.id],B=q!=null&&q.completed&&k.quiz.length?ce(k.quiz,q.answers).pct:null;return r`<li>
                  <a
                    class="lesson-link ${q!=null&&q.completed?"done":""}"
                    href="/solve/course/${t.id}/lesson/${S+1}"
                    data-link
                  >
                    <span class="num" aria-hidden="true"
                      >${q!=null&&q.completed?f("check","icon-inline"):S+1}</span
                    >
                    <span
                      ><strong>${k.title}</strong
                      ><span class="meta">
                        · ${k.minutes}
                        min${k.adapted?" · added for you":""}${q!=null&&q.completed?" · completed":""}</span
                      ></span
                    >
                    ${B!==null?r`<span class="score badge ${B>=60?"green":"amber"}">${B}%</span>`:r`<span></span>`}
                  </a>
                </li>`})}
            </ol>
            <div class="mt-2">
              ${i?r`<a class="btn ${($=t.final)!=null&&$.passed?"":"btn-accent"} btn-block" href="/solve/course/${t.id}/final" data-link>${f("target")} Final assessment${((b=t.final)==null?void 0:b.score)!==null&&((h=t.final)==null?void 0:h.score)!==void 0?` · best ${t.final.score}%`:""}</a>`:r`<p class="small muted mb-0">${f("lock","icon-inline")} The final assessment unlocks when you finish the core lessons.</p>`}
              ${(w=t.final)!=null&&w.passed?r`<a class="btn btn-primary btn-block mt-1" href="/solve/course/${t.id}/certificate" data-link>${f("award")} View certificate</a>`:""}
            </div>
          </section>

          <div>
            <section class="card" aria-labelledby="roadmap-title">
              <h2 id="roadmap-title">Roadmap</h2>
              <ol class="roadmap">
                ${t.plan.roadmap.map((k,S)=>r`<li>
                      <span class="dot" aria-hidden="true">${S+1}</span>
                      <div>
                        <strong>${k.title}</strong
                        ><span class="visually-hidden"> (${k.stage})</span>
                        <p>${k.summary}</p>
                      </div>
                    </li>`)}
              </ol>
            </section>

            <section class="card" aria-labelledby="weak-title">
              <h2 id="weak-title">Areas to strengthen</h2>
              ${l.length?r` <p>
                        Based on your quiz answers, these topics need more
                        practice:
                      </p>
                      <div class="flex mb-2">
                        ${l.map(k=>r`<span class="badge amber">${k}</span>`)}
                      </div>`:r`<p class="muted">
                      ${c?"No weak areas so far – nice work.":"Complete a lesson quiz and we will highlight anything that needs more practice."}
                    </p>`}
              ${(A=t.adaptNotes)!=null&&A.length?r`<p class="small"><strong>Latest adaptation:</strong> ${t.adaptNotes[t.adaptNotes.length-1]}</p>`:""}
              ${o?ct(o):""}
              ${c>=2?r` <button
                        type="button"
                        class="btn btn-block"
                        data-adapt
                        data-focus="adapt"
                        ${be()?T("disabled"):""}
                      >
                        ${f("refresh")}
                        ${l.length?"Adapt my next lessons to my weak areas":"Add more lessons at my level"}
                        <span class="cost">(1 request)</span>
                      </button>
                      <p class="small muted mt-1 mb-0">
                        New lessons are inserted after your last completed
                        lesson.
                      </p>`:""}
            </section>
          </div>
        </div>`)};return e.addEventListener("click",async l=>{var p,u;const c=l.target.closest("[data-adapt]");if(!c||be())return;o=null;const i=Re(t),d=lt(c,"Creating lessons…");try{const v=await we("adapt_course",{mode:"course",context:{courseTitle:t.title,objective:t.plan.objective,level:t.plan.level,count:i.length?Math.min(2,i.length):1,weakTopics:i,completedLessons:t.lessons.filter(w=>{var A,k;return(k=(A=t.lessonState)==null?void 0:A[w.id])==null?void 0:k.completed}).map(w=>({title:w.title,score:ce(w.quiz,t.lessonState[w.id].answers).pct}))}});let $=0;t.lessons.forEach((w,A)=>{var k,S;(S=(k=t.lessonState)==null?void 0:k[w.id])!=null&&S.completed&&($=A+1)});const b=Date.now().toString(36),h=v.data.lessons.map((w,A)=>({...w,id:`a${b}${A}`,adapted:!0}));t.lessons.splice($,0,...h),t.adaptNotes=[...t.adaptNotes||[],v.data.note],R.saveItem(t),n(),W(`${h.length} new lesson${h.length>1?"s":""} added to your course.`),(u=(p=e.querySelector("#lessons-title"))==null?void 0:p.focus)==null||u.call(p)}catch(v){d(),o=v,ae(e,n),v instanceof K&&v.code.startsWith("DAILY_LIMIT")&&Ft(v)}},{signal:s.signal}),n(),()=>s.abort()}function Wa(e,{id:a}){const t=ze(a);if(!t)return fe(e);me(`Certificate – ${t.title}`);const s=new AbortController,o=()=>{var l;if(!((l=t.final)!=null&&l.passed)){j(e,r`<div class="narrow card">
            <h1>Certificate not available yet</h1>
            <p>
              Pass the final assessment (${se}% or more) to unlock your
              certificate.
            </p>
            <a class="btn btn-primary" href="/solve/course/${t.id}" data-link
              >Back to the course</a
            >
          </div>`);return}const n=R.state.learnerName;j(e,r` <nav class="breadcrumb no-print" aria-label="Breadcrumb">
            <a href="/solve/course/${t.id}" data-link
              >${f("arrowLeft","icon-inline")} ${t.title}</a
            >
          </nav>
          <h1 class="visually-hidden">Certificate of completion</h1>
          <div class="narrow no-print card soft">
            <div class="field mb-0">
              <label for="learner-name">Name to show on the certificate</label>
              <input
                type="text"
                id="learner-name"
                maxlength="60"
                value="${n}"
                placeholder="Your name"
                autocomplete="name"
              />
              <p class="hint">Stored only in this browser.</p>
            </div>
            <div class="btn-row mt-2">
              <button type="button" class="btn btn-primary" data-print>
                ${f("printer")} Print or save as PDF
              </button>
            </div>
          </div>
          <section class="certificate bp-cert" aria-label="Certificate">
            <svg
              class="seal"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="44" />
              <circle cx="50" cy="50" r="38" stroke-dasharray="2 4" />
              <circle cx="50" cy="50" r="24" />
              <path d="M50 6v14M50 80v14M6 50h14M80 50h14" />
              <path d="M50 26l6 18 18 6-18 6-6 18-6-18-18-6 18-6z" />
              <path
                d="M41 50l6 6 12-13"
                stroke-width="2.4"
                stroke-linecap="round"
              />
            </svg>
            <p class="cert-kicker">
              APTO Solve · Certificate No. ${t.id.toUpperCase()}
            </p>
            <h2>Certificate of Completion</h2>
            <p>This is to certify that</p>
            <p class="recipient" id="cert-name">${n||"Your name"}</p>
            <p>has successfully completed the self-paced course</p>
            <p class="course-name">${t.title}</p>
            <table class="cert-titleblock">
              <tr>
                <th scope="row">Date</th>
                <td>${Ne(t.final.completedAt||Date.now())}</td>
                <th scope="row">Final assessment</th>
                <td>${t.final.score}%</td>
              </tr>
              <tr>
                <th scope="row">Level</th>
                <td>${t.plan.level}</td>
                <th scope="row">Drawn by</th>
                <td>APTO Solve</td>
              </tr>
            </table>
            <p class="cert-note">
              Self-directed learning with AI-generated content. This certificate
              records personal course completion and is not an accredited
              qualification.
            </p>
          </section>`)};return e.addEventListener("input",n=>{if(n.target.id==="learner-name"){const l=n.target.value.slice(0,60);R.update(c=>{c.learnerName=l}),e.querySelector("#cert-name").textContent=l||"Your name"}},{signal:s.signal}),e.addEventListener("click",n=>{n.target.closest("[data-print]")&&window.print()},{signal:s.signal}),o(),()=>s.abort()}function Xe(e,a,t){return e!=null&&e.length?r`${e.map((s,o)=>Va(s,a[o],`${t}-${o}`,o,e.length))}`:""}function Va(e,a,t,s,o){const n=a==null?void 0:a.checked;if(e.type==="mcq")return r` <fieldset class="quiz-question" id="${t}">
      <legend>
        <span class="q-num">Question ${s+1} of ${o} · multiple choice</span
        >${e.question}
      </legend>
      <div class="quiz-options">
        ${e.options.map((c,i)=>{const d=a&&Number(a.given)===i,p=n?i===e.answerIndex?"correct":d?"incorrect":"":"";return r`<label class="choice ${p}" for="${t}-o${i}">
            <input
              type="radio"
              name="${t}"
              id="${t}-o${i}"
              value="${i}"
              ${d?T("checked"):""}
              ${n?T("disabled"):""}
            />
            <span
              >${c}${n&&i===e.answerIndex?r` <strong>(correct answer)</strong>`:""}${n&&d&&i!==e.answerIndex?r` <strong>(your answer)</strong>`:""}</span
            >
          </label>`})}
      </div>
      ${n?r` <div
              class="feedback ${a.correct?"correct":"incorrect"}"
              role="status"
              tabindex="-1"
            >
              <strong
                >${a.correct?"Correct – well done!":"Not quite."}</strong
              >
              ${e.explanation?r`<span>${e.explanation}</span>`:""}
            </div>`:r` <button
              type="button"
              class="btn btn-primary btn-sm"
              data-quiz-check="${s}"
              data-focus="${t}-check"
            >
              Check answer
            </button>`}
    </fieldset>`;const l=a==null?void 0:a.hint;return r` <div
    class="quiz-question"
    role="group"
    aria-labelledby="${t}-label"
    id="${t}"
  >
    <label id="${t}-label" for="${t}-text"
      ><span class="q-num">Question ${s+1} of ${o} · short answer</span
      ><strong>${e.question}</strong></label
    >
    <textarea
      id="${t}-text"
      rows="2"
      maxlength="400"
      class="mt-1"
      ${n?T("readonly"):""}
    >
${(a==null?void 0:a.given)||""}</textarea>
    ${n?r` <div
            class="feedback ${a.correct===!0?"correct":a.correct===!1?"incorrect":"neutral"}"
            role="status"
            tabindex="-1"
          >
            <strong>Model answer</strong>
            <span>${e.modelAnswer}</span>
            ${e.explanation?r`<p class="mb-0 mt-1">${e.explanation}</p>`:""}
            ${l&&l.total?r`<p class="small mt-1 mb-0">${l.matched.length?`Your answer mentions: ${l.matched.join(", ")}.`:"Your answer does not mention the key words we expected – compare it with the model answer."}</p>`:""}
            ${a.correct===null||a.correct===void 0?r` <p class="mt-1 mb-0">
                      <strong>Was your answer right?</strong>
                    </p>
                    <div class="btn-row mt-1">
                      <button
                        type="button"
                        class="btn btn-sm ${l!=null&&l.likelyCorrect?"btn-primary":""}"
                        data-self-mark="${s}"
                        data-value="yes"
                        data-focus="${t}-yes"
                      >
                        ${f("check")} Yes, I got it
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm ${l&&!l.likelyCorrect?"btn-primary":""}"
                        data-self-mark="${s}"
                        data-value="no"
                        data-focus="${t}-no"
                      >
                        Not quite
                      </button>
                    </div>`:r`<p class="mt-1 mb-0">
                    <strong
                      >${a.correct?"Marked as correct.":"Marked for review – this topic will be revisited."}</strong
                    >
                  </p>`}
          </div>`:r`<div class="btn-row mt-1">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              data-quiz-check="${s}"
              data-focus="${t}-check"
            >
              Check answer
            </button>
          </div>`}
  </div>`}function Ke(e,a,t,s){const o=e.target.closest("[data-quiz-check]"),n=e.target.closest("[data-self-mark]");if(o&&o.closest(`[id^="${s}-"]`)){const l=Number(o.dataset.quizCheck),c=a[l],i=`${s}-${l}`;if(c.type==="mcq"){const d=document.querySelector(`input[name="${i}"]:checked`);if(!d)return{handled:!0,error:"Please choose an answer first."};const p=Number(d.value);t[l]={given:p,checked:!0,correct:p===c.answerIndex}}else{const d=document.getElementById(`${i}-text`).value.trim();if(!d)return{handled:!0,error:"Please type an answer first."};t[l]={given:d,checked:!0,correct:null,hint:wa(d,c.acceptableKeywords)}}return{handled:!0,focus:`#${i}`}}if(n&&n.closest(`[id^="${s}-"]`)){const l=Number(n.dataset.selfMark);return t[l]&&(t[l].correct=n.dataset.value==="yes"),{handled:!0,focus:`#${s}-${l}`}}return{handled:!1}}function Ya(e,a){const t=ce(e,a);return{...t,text:`${t.correct} of ${t.total} correct (${t.pct}%)`}}function Xa(e,{id:a}){const t=ze(a);if(!t)return fe(e);me(`Final assessment – ${t.title}`);const s=new AbortController,o=t.plan.finalAssessment||[];t.final=t.final||{answers:{},score:null,passed:!1};const n=()=>R.saveItem(t),l=()=>{if(!_t(t)){j(e,r` <nav class="breadcrumb" aria-label="Breadcrumb">
              <a href="/solve/course/${t.id}" data-link
                >${f("arrowLeft","icon-inline")} ${t.title}</a
              >
            </nav>
            <div class="narrow card">
              <h1>Final assessment</h1>
              ${U("info","Not unlocked yet",r`<p class="mb-0">Finish all the core lessons first, then come back to take the final assessment.</p>`,"lock")}
              <a class="btn btn-primary" href="/solve/course/${t.id}" data-link
                >Back to the course</a
              >
            </div>`);return}const c=ce(o,t.final.answers),i=c.complete,d=zt(t);j(e,r` <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/solve/course/${t.id}" data-link
              >${f("arrowLeft","icon-inline")} ${t.title}</a
            >
          </nav>
          <div class="narrow">
            <p class="eyebrow">Final assessment</p>
            <h1>${t.title}</h1>
            <p class="lead">
              ${o.length} questions covering the whole course. You need
              ${se}% to earn your certificate. This does not use any
              requests.
            </p>

            ${i?r` <section
                    class="card center"
                    aria-labelledby="result-title"
                  >
                    <div
                      class="score-ring"
                      style="background:${c.pct>=se?"var(--green-soft)":"var(--amber-soft)"};color:${c.pct>=se?"var(--green)":"var(--amber)"}"
                    >
                      ${c.pct}%
                    </div>
                    <h2 id="result-title" tabindex="-1">
                      ${c.pct>=se?"You passed – congratulations!":"Not quite there yet"}
                    </h2>
                    <p>
                      ${c.correct} of ${c.total}
                      correct.${c.pct>=se?"":` You need ${se}% to pass. Review your weak areas and try again – retakes are free.`}
                    </p>
                    <div class="btn-row" style="justify-content:center">
                      ${t.final.passed?r`<a class="btn btn-primary" href="/solve/course/${t.id}/certificate" data-link>${f("award")} View your certificate</a>`:""}
                      <button type="button" class="btn" data-retake>
                        ${f("refresh")} Retake assessment
                      </button>
                    </div>
                  </section>`:""}

            <section class="card">
              ${Xe(o,t.final.answers,"final")}
              <p class="mb-0">
                <strong>Progress:</strong> ${c.answered} of ${c.total} answered
              </p>
            </section>

            ${Object.keys(d).length?r` <section
                    class="card soft"
                    aria-labelledby="topics-title"
                  >
                    <h2 id="topics-title">Your results by topic</h2>
                    <ul class="item-list">
                      ${Object.entries(d).map(([p,u])=>r`<li>${ge(u.right/u.total*100,`${p} (${u.right}/${u.total})`)}</li>`)}
                    </ul>
                  </section>`:""}
          </div>`)};return e.addEventListener("click",c=>{var d,p;const i=Ke(c,o,t.final.answers,"final");if(i.handled){i.error&&W(i.error);const u=ce(o,t.final.answers);u.complete&&(t.final.score=Math.max(t.final.score||0,u.pct),u.pct>=se&&!t.final.passed&&(t.final.passed=!0,t.final.completedAt=Date.now(),t.status="complete")),n(),ae(e,l),u.complete&&((d=e.querySelector("#result-title"))==null||d.focus());return}c.target.closest("[data-retake]")&&(t.final.answers={},n(),l(),(p=e.querySelector("h1"))==null||p.focus())},{signal:s.signal}),l(),()=>s.abort()}const O={photos:[],homeRequest:"",homeMode:"auto"},Mt=[{text:"Teach me how to change a bathroom tap.",tag:"Practical",icon:"droplet",mode:"practical"},{text:"Help me unblock a sink.",tag:"Practical",icon:"wrench",mode:"practical"},{text:"Show me how to service a bicycle.",tag:"Practical",icon:"bike",mode:"practical"},{text:"Teach me conversational Spanish.",tag:"Course",icon:"language",mode:"course"},{text:"Teach me photography.",tag:"Course",icon:"camera",mode:"course"},{text:"Explain basic Excel.",tag:"Course",icon:"table",mode:"course"},{text:"Create a beginner course on British history.",tag:"Course",icon:"castle",mode:"course"},{text:"Teach me beginner conversational Italian.",tag:"Course",icon:"book",mode:"course"}],Ka=[{id:"auto",label:"Let APTO Solve decide",hint:"Best if you are not sure",icon:"sparkle"},{id:"practical",label:"Practical skill",hint:"Step-by-step help with a job",icon:"wrench"},{id:"course",label:"Structured course",hint:"Lessons, quizzes and a certificate",icon:"book"}];function Qa(e){const a=new AbortController;let t="",s=null;const o=()=>{const l=R.listItems().filter(i=>i.status!=="complete"&&(i.kind==="task"||i.kind==="course")).slice(0,3),c=te();j(e,r` <section class="hero" aria-labelledby="home-title">
            <img
              class="hero-mascot"
              src="/solve/mascot.webp"
              srcset="/solve/mascot-256.webp 256w, /solve/mascot.webp 511w"
              sizes="(min-width: 640px) 200px, 76px"
              width="511"
              height="480"
              alt=""
              fetchpriority="high"
            />
            <p class="eyebrow">Your patient AI instructor</p>
            <h1 id="home-title">What would you like to learn today?</h1>
            <p class="lead">
              Describe a job you want to tackle or a subject you want to learn.
              APTO Solve checks it for safety, asks only what it needs, then
              guides you one step at a time.
            </p>
          </section>

          ${s?ct(s):""}

          <form class="card request-card" id="request-form" novalidate>
            <div class="field">
              <label for="request">Describe what you want to learn or do</label>
              <textarea
                id="request"
                class="request-input"
                name="request"
                maxlength="${H.MAX_REQUEST_CHARS+50}"
                placeholder="For example: “Teach me how to change a bathroom tap” or “Teach me basic photography”"
                aria-describedby="request-count${t?" request-error":""}"
                ${t?T('aria-invalid="true"'):""}
              >
${O.homeRequest}</textarea>
              <div class="flex between">
                ${t?r`<p class="field-error" id="request-error" role="alert">${f("alert")}<span>${t}</span></p>`:r`<span></span>`}
                <span class="char-count" id="request-count"
                  >${O.homeRequest.length} /
                  ${H.MAX_REQUEST_CHARS}</span
                >
              </div>
            </div>

            <fieldset>
              <legend>How would you like to learn?</legend>
              <div class="segmented">
                ${Ka.map(i=>r` <label class="choice">
                      <input
                        type="radio"
                        name="mode"
                        value="${i.id}"
                        ${O.homeMode===i.id?"checked":""}
                      />
                      ${f(i.icon,"choice-icon")}
                      <span
                        ><strong>${i.label}</strong
                        ><span class="small">${i.hint}</span></span
                      >
                    </label>`)}
              </div>
            </fieldset>

            <details class="disclosure" ${O.photos.length?"open":""}>
              <summary>
                ${f("camera","icon-inline")} Add photos of the current setup
                <span class="muted small">(optional, for practical jobs)</span>
              </summary>
              <div>
                <div id="home-photos"></div>
                <p class="hint">
                  Photos help the AI recognise visible parts and ask better
                  questions. It will tell you what it cannot see or confirm.
                  Please avoid faces, addresses and personal documents.
                </p>
              </div>
            </details>

            <div class="btn-row mt-2">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                id="start-btn"
                data-focus="start"
                ${c<=0?T('disabled aria-describedby="out-of-requests"'):""}
              >
                ${f("play")} Start Learning
              </button>
              <span class="small muted"
                >Uses 1 of your ${G} free daily requests · ${c} left
                today</span
              >
            </div>
            ${c<=0?ut():""}
            <p class="small muted mt-1 mb-0">
              ${f("shield","icon-inline")} Every request is safety-screened.
              Dangerous jobs (such as gas or mains electrical work) are referred
              to a qualified professional.
            </p>
          </form>

          ${l.length?r` <section class="mt-3" aria-labelledby="continue-title">
                  <h2 id="continue-title">Continue where you left off</h2>
                  <ul class="item-list">
                    ${l.map(i=>{const d=i.kind==="task"?et(i):tt(i);return r`<li class="item-card">
                        <div class="head">
                          <h3>
                            <a href="/solve/${i.kind}/${i.id}" data-link
                              >${i.title}</a
                            >
                          </h3>
                          <span
                            class="badge ${i.kind==="task"?"amber":"primary"}"
                            >${i.kind==="task"?"Practical":"Course"}</span
                          >
                        </div>
                        ${ge(d,"Progress")}
                      </li>`})}
                  </ul>
                </section>`:""}

          <section class="mt-3" aria-labelledby="examples-title">
            <h2 id="examples-title">Try an example</h2>
            <div class="examples">
              ${Mt.map((i,d)=>r` <button
                    type="button"
                    class="example-card"
                    data-example="${d}"
                  >
                    ${f(i.icon)}
                    <span><span class="tag">${i.tag}</span>${i.text}</span>
                  </button>`)}
            </div>
          </section>

          <section class="mt-3" aria-labelledby="how-title">
            <h2 id="how-title">How it works</h2>
            <ol class="steps-explainer">
              <li>
                <h3>Tell us your goal</h3>
                <p class="mb-0">
                  A job like replacing a tap, or a subject like Italian or
                  Excel.
                </p>
              </li>
              <li>
                <h3>Safety check</h3>
                <p class="mb-0">
                  We screen every request and give practical jobs a Green, Amber
                  or Red rating.
                </p>
              </li>
              <li>
                <h3>A few quick questions</h3>
                <p class="mb-0">
                  Only what is needed to personalise your guide or course.
                </p>
              </li>
              <li>
                <h3>Learn step by step</h3>
                <p class="mb-0">
                  One step or short lesson at a time, with help buttons, quizzes
                  and saved progress.
                </p>
              </li>
            </ol>
          </section>

          <section class="mt-3 grid grid-2" aria-label="Safety and privacy">
            <div class="card soft">
              <div class="card-title">
                ${f("shield")}
                <h2>Safety first</h2>
              </div>
              <p>
                APTO Solve provides <strong>educational guidance only</strong>.
                It cannot inspect, certify or guarantee any work, and a photo
                can never prove something is safe.
              </p>
              <p class="mb-0">
                It will not guide gas work, mains electrics, structural changes,
                asbestos, work at height, high-risk vehicle repairs or medical
                treatment.
                <a href="/solve/safety" data-link>Read our safety information</a>.
              </p>
            </div>
            <div class="card soft">
              <div class="card-title">
                ${f("lock")}
                <h2>Your privacy</h2>
              </div>
              <p>
                No account needed. Your progress is saved only in this browser.
                Requests and any photos you choose to send go to Google Gemini
                for analysis; photos are not kept by APTO Solve.
              </p>
              <p class="mb-0">
                <a href="/solve/privacy" data-link>Read the privacy information</a>.
              </p>
            </div>
          </section>`),dt(e.querySelector("#home-photos"),O.photos,{label:"Photos (optional)"})},n=async()=>{var p,u;const l=e.querySelector("#request-form"),c=l.request.value.trim();if(O.homeRequest=l.request.value,O.homeMode=l.mode.value||"auto",s=null,c.length<3){t=c?"Please describe what you want to learn in a few more words.":"Please tell us what you would like to learn or do.",o(),e.querySelector("#request").focus();return}if(c.length>H.MAX_REQUEST_CHARS){t=`Please shorten your request to ${H.MAX_REQUEST_CHARS} characters or fewer.`,o(),e.querySelector("#request").focus();return}if(te()<=0){o(),(p=e.querySelector("#out-of-requests"))==null||p.focus();return}if(t="",O.photos.length&&!await it()){s={message:"Your photos were not sent. Remove them, or start again and accept the photo notice."},o();return}const i=new AbortController,d=Bt(e,"assess",()=>i.abort());try{const v=await we("assess",{request:c,mode:O.homeMode,images:nt(O.photos)},{signal:i.signal});if(v.refused){R.setDraft({refusal:v.data,createdAt:Date.now()}),oe("/refused");return}R.setDraft({request:c,mode:O.homeMode,assessment:v.data,createdAt:Date.now(),hadPhotos:O.photos.length>0}),oe("/start")}catch(v){if(v instanceof K&&v.code==="CANCELLED"){o();return}if(v instanceof K&&v.code.startsWith("DAILY_LIMIT")){s=null,o(),(u=e.querySelector("#out-of-requests"))==null||u.focus();return}s=v,o()}finally{d()}};return e.addEventListener("submit",l=>{l.target.id==="request-form"&&(l.preventDefault(),n())},{signal:a.signal}),e.addEventListener("input",l=>{if(l.target.id==="request"){O.homeRequest=l.target.value;const c=e.querySelector("#request-count");c.textContent=`${l.target.value.length} / ${H.MAX_REQUEST_CHARS}`,c.classList.toggle("over",l.target.value.length>H.MAX_REQUEST_CHARS)}},{signal:a.signal}),e.addEventListener("change",l=>{l.target.name==="mode"&&(O.homeMode=l.target.value)},{signal:a.signal}),e.addEventListener("click",l=>{const c=l.target.closest("[data-example]");if(!c)return;const i=Mt[Number(c.dataset.example)];O.homeRequest=i.text,O.homeMode=i.mode,t="",o();const d=e.querySelector("#request");d.focus(),d.scrollIntoView({block:"center"})},{signal:a.signal}),o(),()=>a.abort()}const Ja=[{kind:"another_way",label:"Explain it another way",icon:"refresh"},{kind:"practical_example",label:"Give me a practical example",icon:"lightbulb"},{kind:"test_me",label:"Test me",icon:"target"}],Za={another_way:"Another way to think about it",practical_example:"A practical example",test_me:"Extra practice questions"};function es(e,{id:a,n:t}){var $;const s=ze(a),o=Number(t)-1,n=($=s==null?void 0:s.lessons)==null?void 0:$[o];if(!s||!n)return fe(e);me(`${n.title} – ${s.title}`);const l=new AbortController,c=$a(s,n.id),i=()=>R.saveItem(s);let d="";const p=(b,h)=>{var w,A;return r` <article class="card help-response" aria-labelledby="extra-${h}">
        <h3 id="extra-${h}" tabindex="-1">${Za[b.kind]}</h3>
        ${b.data.message?r`<p class="pre-wrap">${b.data.message}</p>`:""}
        ${b.data.example?r`<div class="worked-example mb-2"><p class="pre-wrap mb-0">${b.data.example}</p></div>`:""}
        ${(w=b.data.bullets)!=null&&w.length?r`<ul>
                ${Z(b.data.bullets)}
              </ul>`:""}
        ${(A=b.data.quiz)!=null&&A.length?r`<div>${Xe(b.data.quiz,b.answers||(b.answers={}),`x-${n.id}-${h}`)}</div>`:""}
      </article>`},u=()=>{var w,A,k;const b=Ya(n.quiz,c.answers),h=o+1<s.lessons.length?o+2:null;j(e,r` <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/solve/course/${s.id}" data-link
              >${f("arrowLeft","icon-inline")} ${s.title}</a
            >
          </nav>
          <div class="narrow">
            <header class="mb-2">
              <p class="eyebrow">
                Lesson ${o+1} of
                ${s.lessons.length}${n.adapted?" · added for you":""}
              </p>
              <h1>${n.title}</h1>
              <div class="flex">
                <span class="badge"
                  >${f("clock","icon-inline")} ${n.minutes} min</span
                >${c.completed?r`<span class="badge green">${f("check","icon-inline")} Completed</span>`:""}
              </div>
            </header>

            ${(w=n.objectives)!=null&&w.length?r`<section class="card soft">
                    <h2 class="mb-0" style="font-size:1.1rem">
                      By the end of this lesson you will be able to:
                    </h2>
                    <ul class="mt-1">
                      ${Z(n.objectives)}
                    </ul>
                  </section>`:""}

            <article class="card lesson-body">
              <figure class="bp-figure lesson-figure">
                ${T(Ra(s,n,o))}
                <figcaption class="small muted">
                  Fig. ${o+1} – ${n.title}
                </figcaption>
              </figure>
              ${n.sections.map(S=>r`<section>
                    <h2>${S.heading}</h2>
                    <p class="pre-wrap">${S.body}</p>
                  </section>`)}
              ${(A=n.workedExample)!=null&&A.body?r`<section class="worked-example">
                      <h3>
                        ${f("lightbulb","icon-inline")}
                        ${n.workedExample.title||"Worked example"}
                      </h3>
                      <p class="pre-wrap mb-0">${n.workedExample.body}</p>
                    </section>`:""}
              ${(k=n.keyPoints)!=null&&k.length?r`<section class="key-points">
                      <h3>Key points</h3>
                      <ul>
                        ${Z(n.keyPoints)}
                      </ul>
                    </section>`:""}
            </article>

            <section class="card no-print" aria-labelledby="extra-title">
              <h2 id="extra-title" style="font-size:1.15rem">
                Want more help?
              </h2>
              <p class="small muted">Each option uses 1 free request.</p>
              <div class="help-grid">
                ${Ja.map(S=>r`<button type="button" class="btn btn-sm" data-extra="${S.kind}" data-focus="extra-${S.kind}" ${be()||te()<=0?T("disabled"):""}>${f(S.icon)} ${S.label}</button>`)}
              </div>
            </section>
            <div aria-live="polite">
              ${(c.extras||[]).map((S,q)=>p(S,q)).reverse()}
            </div>

            <section class="card" aria-labelledby="quiz-title">
              <div class="card-title">
                ${f("target")}
                <h2 id="quiz-title">Check your understanding</h2>
              </div>
              ${n.quiz.length?r` <p class="muted">
                        Answer each question for instant feedback. These
                        questions do not use any requests.
                      </p>
                      ${Xe(n.quiz,c.answers,`q-${n.id}`)}
                      ${d?r`<p class="field-error" role="alert">${f("alert")}<span>${d}</span></p>`:""}
                      <p class="mb-0">
                        <strong>Score so far:</strong> ${b.text}
                      </p>`:r`<p>No quiz for this lesson.</p>`}
            </section>

            <div class="btn-row between">
              ${o>0?r`<a class="btn" href="/solve/course/${s.id}/lesson/${o}" data-link>${f("arrowLeft")} Previous lesson</a>`:r`<a class="btn" href="/solve/course/${s.id}" data-link>${f("arrowLeft")} Course overview</a>`}
              ${c.completed?h?r`<a class="btn btn-primary" href="/solve/course/${s.id}/lesson/${h}" data-link>Next lesson ${f("arrowRight")}</a>`:r`<a class="btn btn-primary" href="/solve/course/${s.id}" data-link>Back to course ${f("arrowRight")}</a>`:r`<button type="button" class="btn btn-primary" data-complete-lesson data-focus="complete-lesson">${f("check")} Complete lesson</button>`}
            </div>
          </div>`)},v=()=>{var h,w;const b=ce(n.quiz,c.answers);if(!b.complete){d=`Please answer all ${b.total} questions first (${b.answered} done).`,ae(e,u),(h=e.querySelector("#quiz-title"))==null||h.scrollIntoView({block:"start"});return}c.completed=!0,c.score=b.pct,i(),u(),W(b.pct>=60?`Lesson complete – ${b.pct}%. Great work!`:`Lesson complete – ${b.pct}%. We have noted the topics to revisit.`),(w=e.querySelector("h1"))==null||w.focus()};return e.addEventListener("click",async b=>{var A,k;let h=Ke(b,n.quiz,c.answers,`q-${n.id}`);if(!h.handled){for(const[S,q]of(c.extras||[]).entries())if((A=q.data.quiz)!=null&&A.length&&(q.answers=q.answers||{},h=Ke(b,q.data.quiz,q.answers,`x-${n.id}-${S}`),h.handled))break}if(h.handled){if(d=h.error||"",h.error&&W(h.error),i(),ae(e,u),h.focus&&!h.error){const S=e.querySelector(h.focus),q=(S==null?void 0:S.querySelector("[data-self-mark], .feedback"))||S;q&&!e.contains(document.activeElement)&&((k=q.focus)==null||k.call(q))}return}if(b.target.closest("[data-complete-lesson]"))return v();const w=b.target.closest("[data-extra]");if(w&&!be()){const S=w.dataset.extra,q=lt(w,"Thinking…");e.querySelectorAll("[data-extra]").forEach(B=>{B!==w&&(B.disabled=!0)});try{const B=[n.title,...n.sections.map(m=>`${m.heading}: ${m.body}`),...n.keyPoints||[]].join(`
`).slice(0,H.MAX_CONTEXT_CHARS),de=await we("course_help",{mode:"course",context:{kind:S,courseTitle:s.title,level:s.plan.level,lessonTitle:n.title,lessonSummary:B,weakTopics:Re(s)}});c.extras=c.extras||[],c.extras.push({kind:S,data:de.data,answers:{},at:Date.now()}),i(),u();const y=e.querySelector(`#extra-${c.extras.length-1}`);y==null||y.focus(),y==null||y.scrollIntoView({block:"center"})}catch(B){q(),u(),Ft(B)}}},{signal:l.signal}),u(),()=>l.abort()}const ts=e=>e.kind==="task"?et(e):tt(e);function Gt(e,{actions:a=!0}={}){var o;const t=ts(e),s=`/${e.kind}/${e.id}`;return r` <li class="item-card">
    <div class="head">
      <h3><a href="${s}" data-link>${e.title}</a></h3>
      <div class="flex">
        <span class="badge ${e.kind==="task"?"amber":"primary"}"
          >${e.kind==="task"?"Practical task":"Course"}</span
        >
        ${e.kind==="task"?le(e.rating):""}
        ${e.status==="complete"?r`<span class="badge green">${f("check","icon-inline")} Complete</span>`:""}
      </div>
    </div>
    ${ge(t,"Progress")}
    <p class="small muted mb-0">
      Started ${Ne(e.createdAt)} · last updated
      ${Ne(e.updatedAt)}
    </p>
    ${a?r`<div class="btn-row">
            <a class="btn btn-primary btn-sm" href="${s}" data-link
              >${e.status==="complete"?"Review":"Resume"}<span
                class="visually-hidden"
              >
                ${e.title}</span
              ></a
            >
            ${e.kind==="course"&&((o=e.final)!=null&&o.passed)?r`<a class="btn btn-sm" href="/solve/course/${e.id}/certificate" data-link>${f("award")} Certificate</a>`:""}
            <button
              type="button"
              class="btn btn-danger btn-sm"
              data-delete="${e.id}"
            >
              ${f("trash")} Delete<span class="visually-hidden">
                ${e.title}</span
              >
            </button>
          </div>`:""}
  </li>`}function as(e){const a=new AbortController;let t="all";const s=()=>{const o=R.listItems().filter(c=>c.kind==="task"||c.kind==="course"),n=o.filter(c=>t==="all"||(t==="complete"?c.status==="complete":c.kind===t)),l=[["all","All"],["task","Practical tasks"],["course","Courses"],["complete","Completed"]];j(e,r` <p class="eyebrow">Saved learning</p>
        <h1>My learning</h1>
        <p class="lead">
          Your tasks and courses are saved automatically in this browser.
          Clearing your browser data removes them.
        </p>
        ${R.storageAvailable?"":U("amber","Saving is not available",r`<p class="mb-0">Your browser is blocking local storage (for example in private browsing), so progress will be lost when you close this tab.</p>`)}

        <div class="filter-bar" role="group" aria-label="Filter saved learning">
          ${l.map(([c,i])=>r`<button type="button" class="btn btn-sm ${t===c?"btn-primary":""}" data-filter="${c}" aria-pressed="${t===c}">${i}</button>`)}
        </div>

        ${n.length?r`<ul class="item-list">
                ${n.map(c=>Gt(c))}
              </ul>`:r` <div class="card empty-state">
                <div class="bp-figure state-figure">
                  ${T(ot("emptySaved"))}
                </div>
                <h2>
                  ${o.length?"Nothing matches this filter":"Nothing saved yet"}
                </h2>
                <p>
                  ${o.length?"Try a different filter.":"Your drawer is empty for now. When you start a practical task or a course, it will be filed here so you can pick up where you left off."}
                </p>
                <a class="btn btn-primary" href="/solve/" data-link>Start learning</a>
              </div>`}
        ${o.length?r` <section
                class="card soft mt-3"
                aria-labelledby="data-title"
              >
                <h2 id="data-title">Your data</h2>
                <p class="small">
                  Download a copy of your saved progress, or remove everything
                  from this browser.
                </p>
                <div class="btn-row">
                  <button type="button" class="btn btn-sm" data-export>
                    ${f("download")} Download my progress (JSON)
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    data-clear
                  >
                    ${f("trash")} Delete all saved learning
                  </button>
                </div>
              </section>`:""}`)};return e.addEventListener("click",async o=>{var c,i,d;const n=o.target.closest("[data-filter]");if(n){t=n.dataset.filter,s(),(c=e.querySelector(`[data-filter="${t}"]`))==null||c.focus();return}const l=o.target.closest("[data-delete]");if(l){const p=R.getItem(l.dataset.delete);p&&await kt("Delete this item?",`“${p.title}” and its progress will be removed from this browser. This cannot be undone.`,"Delete","danger")&&(R.deleteItem(p.id),W("Deleted."),s(),(i=e.querySelector("h1"))==null||i.focus());return}if(o.target.closest("[data-export]")){const p=new Blob([R.exportJson()],{type:"application/json"}),u=document.createElement("a");u.href=URL.createObjectURL(p),u.download=`apto-solve-progress-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(u),u.click(),setTimeout(()=>{URL.revokeObjectURL(u.href),u.remove()},500);return}o.target.closest("[data-clear]")&&await kt("Delete all saved learning?","Every task, course and certificate saved in this browser will be removed. This cannot be undone.","Delete everything","danger")&&(R.clearAll(),$e(),W("All saved learning deleted."),s(),(d=e.querySelector("h1"))==null||d.focus())},{signal:a.signal}),s(),()=>a.abort()}function ss(e){var p;const a=R.listItems(),t=a.filter(u=>u.kind==="task"),s=a.filter(u=>u.kind==="course");let o=0;const n=[];for(const u of s)for(const v of u.lessons){const $=(p=u.lessonState)==null?void 0:p[v.id];$!=null&&$.completed&&(o+=1,v.quiz.length&&n.push(ce(v.quiz,$.answers).pct))}const l=n.length?Math.round(n.reduce((u,v)=>u+v,0)/n.length):null,c=te(),i=a.filter(u=>u.status==="complete").length,d=s.map(u=>({c:u,weak:Re(u)})).filter(u=>u.weak.length);j(e,r` <p class="eyebrow">Progress dashboard</p>
      <h1>Your progress</h1>
      <p class="lead">Everything here is stored only in this browser.</p>

      <section class="card" aria-labelledby="usage-title">
        <div class="card-title">
          ${f("chart")}
          <h2 id="usage-title">Today’s free allowance</h2>
        </div>
        ${ge((G-c)/G*100,`${G-c} of ${G} requests used`)}
        <p class="mt-1 mb-0">
          ${c>0?`You have ${c} free AI request${c===1?"":"s"} left today.`:"You have used today’s free requests."}
          The allowance resets at ${Je()}. Steps, lessons and quizzes
          you already have do not use requests.
        </p>
      </section>

      <div class="grid grid-3 mb-2">
        <div class="stat">
          <div class="value">${t.length}</div>
          <div class="label">Practical tasks</div>
        </div>
        <div class="stat">
          <div class="value">${s.length}</div>
          <div class="label">Courses</div>
        </div>
        <div class="stat">
          <div class="value">${o}</div>
          <div class="label">Lessons completed</div>
        </div>
        <div class="stat">
          <div class="value">${l===null?"–":`${l}%`}</div>
          <div class="label">Average quiz score</div>
        </div>
        <div class="stat">
          <div class="value">${i}</div>
          <div class="label">Finished items</div>
        </div>
        <div class="stat">
          <div class="value">${s.filter(u=>{var v;return(v=u.final)==null?void 0:v.passed}).length}</div>
          <div class="label">Certificates earned</div>
        </div>
      </div>

      <section class="card" aria-labelledby="weak-areas">
        <h2 id="weak-areas">Areas to strengthen</h2>
        ${d.length?r`<ul class="item-list">
                ${d.map(({c:u,weak:v})=>r` <li>
                      <strong
                        ><a href="/solve/course/${u.id}" data-link>${u.title}</a
                        >:</strong
                      >
                      <span class="flex mt-1"
                        >${v.map($=>r`<span class="badge amber">${$}</span>`)}</span
                      >
                    </li>`)}
              </ul>`:r`<p class="muted mb-0">
                No weak areas identified yet. They appear here when quiz answers
                show a topic needs more practice.
              </p>`}
      </section>

      <section aria-labelledby="active-title">
        <h2 id="active-title">In progress</h2>
        ${a.filter(u=>u.status!=="complete").length?r`<ul class="item-list">
                ${a.filter(u=>u.status!=="complete").map(u=>Gt(u,{actions:!1}))}
              </ul>`:r`<div class="card empty-state">
                <div class="bp-figure state-figure">
                  ${T(ot("emptyProgress"))}
                </div>
                <p>
                  Nothing in progress – a blank sheet, ready for your next plan.
                  <a href="/solve/" data-link>Start learning something new</a>.
                </p>
              </div>`}
      </section>`)}function os(e){const a=R.getDraft();if(!(a!=null&&a.refusal)){oe("/",{replace:!0});return}j(e,r`<div class="narrow">
      ${U("info","",r`<p class="mb-0">APTO Solve checked your request before giving any instructions.</p>`,"shield")}
      ${ja(a.refusal)}
    </div>`)}function ns(e,a){return{id:R.newId(),kind:"task",createdAt:Date.now(),request:e,title:a.title,rating:a.rating,plan:a,stage:"overview",checks:{safety:a.safetyChecklist.map(()=>!1),tools:a.tools.map(()=>!1),materials:a.materials.map(()=>!1),prep:a.preparation.map(()=>!1),completion:a.completionChecklist.map(()=>!1)},amberAck:!1,stepIndex:0,stepsDone:a.steps.map(()=>!1),help:{},status:"active"}}function rs(e,a){const t=a.lessons.map((s,o)=>({...s,id:`l${o+1}`,adapted:!1}));return{id:R.newId(),kind:"course",createdAt:Date.now(),request:e,title:a.title,plan:{title:a.title,objective:a.objective,level:a.level,roadmap:a.roadmap,finalAssessment:a.finalAssessment},lessons:t,lessonState:{},final:{answers:{},score:null,passed:!1,completedAt:null},adaptNotes:[],status:"active"}}function is(e){const a=R.getDraft();if(!(a!=null&&a.assessment)){oe("/",{replace:!0});return}const t=new AbortController,s=a.assessment,o=s.type==="practical",n=a.answers||{};let l=null;const c=()=>{j(e,r` <div class="narrow">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/solve/" data-link
              >${f("arrowLeft","icon-inline")} Change my request</a
            >
          </nav>
          <p class="eyebrow">${o?"Practical task":"Structured course"}</p>
          <h1>${s.title}</h1>
          <p class="lead">${s.summary}</p>

          ${l?ct(l):""}
          ${o?r`<div class="mb-2">${Ut(s.rating,s.ratingReason)}</div>`:""}
          ${o&&s.rating==="amber"?U("amber","Take extra care with this job",r`<p class="mb-0">You can continue, but think about whether a professional would be more sensible. We will show you clear points at which to stop.</p>`):""}
          ${a.hadPhotos?r`<div class="mb-2">
                  <h2>What the AI could tell from your photos</h2>
                  ${Ye(s)}
                  <p class="small muted">
                    A photo cannot show hidden damage or confirm anything is
                    safe.
                  </p>
                </div>`:""}

          <form class="card" id="questions-form" novalidate>
            <h2>
              ${s.questions.length?"A few quick questions":"Ready when you are"}
            </h2>
            <p class="muted">
              ${s.questions.length?"These help personalise your guidance. Answer what you can – all are optional.":"No extra questions are needed."}
            </p>

            ${s.questions.map((p,u)=>p.kind==="choice"?r` <fieldset class="mt-2">
                    <legend>${p.question}</legend>
                    ${p.why?r`<p class="hint mb-0">${p.why}</p>`:""}
                    <div class="pill-options mt-1">
                      ${p.options.map((v,$)=>r` <label class="choice">
                            <input
                              type="radio"
                              name="q-${u}"
                              value="${v}"
                              id="q-${u}-${$}"
                              ${n[p.id]===v?T("checked"):""}
                            />
                            <span>${v}</span>
                          </label>`)}
                    </div>
                  </fieldset>`:r` <div class="field mt-2">
                    <label for="q-${u}">${p.question}</label>
                    ${p.why?r`<p class="hint">${p.why}</p>`:""}
                    <input
                      type="text"
                      id="q-${u}"
                      name="q-${u}"
                      maxlength="${H.MAX_ANSWER_CHARS}"
                      value="${n[p.id]||""}"
                    />
                  </div>`)}

            <div class="field mt-2">
              <label for="extra"
                >Anything else that would help?
                <span class="muted">(optional)</span></label
              >
              <textarea
                id="extra"
                name="extra"
                maxlength="${H.MAX_ANSWER_CHARS}"
                rows="3"
                placeholder="${o?"For example: the tap is in a small cloakroom and the pipes are behind a pedestal.":"For example: I have 15 minutes a day and I am going to Rome in June."}"
              >
${n.__extra||""}</textarea>
            </div>

            ${o?r` <div class="mt-2">
                    ${s.photoHelpful&&s.photoPrompt?U("info","A photo would help",r`<p class="mb-0">${s.photoPrompt}</p>`,"camera"):""}
                    <div id="q-photos"></div>
                  </div>`:""}

            <div class="btn-row mt-2">
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                data-focus="build"
                ${te()<=0?T('disabled aria-describedby="out-of-requests"'):""}
              >
                ${f("sparkle")}
                ${o?"Build my step-by-step guide":"Build my course"}
              </button>
              <span class="small muted">Uses 1 free request</span>
            </div>
            ${te()<=0?ut():""}
          </form>
        </div>`),o&&dt(e.querySelector("#q-photos"),O.photos,{label:s.photoHelpful?"Add photos (recommended)":"Add photos (optional)",hint:O.photos.length&&a.hadPhotos?"Your earlier photos will be sent again with your answers.":""})},i=()=>{const p=e.querySelector("#questions-form"),u=[];s.questions.forEach(($,b)=>{var w;const h=(((w=p.elements[`q-${b}`])==null?void 0:w.value)||"").trim();n[$.id]=h,h&&u.push({question:$.question,answer:h.slice(0,H.MAX_ANSWER_CHARS)})});const v=p.extra.value.trim();return n.__extra=v,v&&u.push({question:"Anything else that would help?",answer:v.slice(0,H.MAX_ANSWER_CHARS)}),R.setDraft({...a,answers:n}),u},d=async()=>{var b;const p=i();if(l=null,o&&O.photos.length&&!await it()){l={message:"Your photos were not sent. Remove them to continue without photos, or accept the photo notice."},c();return}const u=o?"practical_plan":"course_plan",v=new AbortController,$=Bt(e,u,()=>v.abort());try{const h=await we(u,{request:a.request,mode:o?"practical":"course",answers:p,images:o?nt(O.photos):[]},{signal:v.signal});if(h.refused){R.setDraft({refusal:h.data,createdAt:Date.now()}),oe("/refused");return}const w=o?ns(a.request,h.data):rs(a.request,h.data);R.saveItem(w),R.setDraft(null),ve(O.photos),O.photos.length=0,O.homeRequest="",oe(`/${w.kind}/${w.id}`)}catch(h){if(h instanceof K&&h.code==="CANCELLED"){c();return}l=h instanceof K&&h.code.startsWith("DAILY_LIMIT")?null:h,c(),(b=e.querySelector("#out-of-requests"))==null||b.focus()}finally{$()}};return e.addEventListener("submit",p=>{p.target.id==="questions-form"&&(p.preventDefault(),d())},{signal:t.signal}),c(),()=>t.abort()}const ls=[[/\b(tap|mixer)\b/i,"Help me unblock a sink."],[/\b(sink|basin|drain|unblock|plug ?hole)\b/i,"Show me how to reseal a bath with silicone."],[/\b(silicone|seal|bath|shower tray)\b/i,"Teach me how to bleed a radiator."],[/\b(radiator|bleed)\b/i,"Show me how to fix a squeaky door hinge."],[/\b(bike|bicycle|chain|puncture)\b/i,"Show me how to fix a bike puncture."],[/\b(shelf|shelves|drill|wall|mirror|picture)\b/i,"Help me fill and sand a small crack in a plaster wall."],[/\b(paint|decorat\w*|roller)\b/i,"Show me how to fill and sand a small crack in a plaster wall."]];function Wt(e){const a=`${e.title} ${e.request}`,t=ls.find(([s])=>s.test(a));return{text:t?t[1]:"Show me how to fix a squeaky door hinge."}}function cs(e){if(!Number.isFinite(e)||e<=0)return"";const a=Math.round(e/6e4);if(a<60)return`${Math.max(1,a)} minute${a===1?"":"s"}`;const t=Math.round(a/6)/10;if(t<24)return`about ${t} hour${t===1?"":"s"}`;const s=Math.round(t/24);return`${s} day${s===1?"":"s"}`}function ds(e){var c;const a=e.plan.steps.length,t=e.plan.steps.filter(i=>i.checkpoint).length,s=Object.values(e.help||{}).reduce((i,d)=>i+d.length,0),o=cs((e.completedAt||0)-(e.createdAt||0)),n=((c=e.feedback)==null?void 0:c.stars)||0,l=Wt(e);return r`<section class="card job-done" aria-labelledby="done-title">
    <div class="job-done-head">
      <div class="bp-figure state-figure">${T(ot("done"))}</div>
      <div>
        <p class="eyebrow">Job done</p>
        <h2 id="done-title" tabindex="-1">
          Well done – “${e.title}” is finished!
        </h2>
        <p class="mb-0">Completed on ${Ne(e.completedAt)}.</p>
      </div>
    </div>
    <h3>Your summary</h3>
    <ul class="job-summary">
      <li>
        <span class="k">Steps completed</span
        ><span class="v">${a} of ${a}</span>
      </li>
      <li>
        <span class="k">Checkpoints confirmed</span
        ><span class="v">${t}</span>
      </li>
      <li>
        <span class="k">Safety rating</span
        ><span class="v">${le(e.rating)}</span>
      </li>
      ${o?r`<li><span class="k">Start to finish</span><span class="v">${o}</span></li>`:""}
      <li>
        <span class="k">Help requests used</span><span class="v">${s}</span>
      </li>
    </ul>
    ${U("amber","Keep an eye on it",r`<p class="mb-0">Check again over the next day or so for leaks, drips or anything unusual. ${rt}</p>`)}
    <fieldset class="job-rating no-print">
      <legend><h3 class="mb-0">How did it go?</h3></legend>
      <div
        class="stars"
        role="group"
        aria-label="Rate this guide from 1 to 5 stars"
      >
        ${[1,2,3,4,5].map(i=>r`<button
              type="button"
              class="star ${i<=n?"on":""}"
              data-stars="${i}"
              data-focus="star-${i}"
              aria-pressed="${i===n}"
              aria-label="${i} star${i>1?"s":""}"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
                />
              </svg>
            </button>`)}
      </div>
      <p class="small muted mb-0">
        ${n?`You rated this guide ${n} out of 5. Saved on this device only.`:"Your rating is saved on this device only."}
      </p>
    </fieldset>
    <section class="next-job no-print" aria-labelledby="next-title">
      <h3 id="next-title">Ready for the next job?</h3>
      <p class="mb-1">A good follow-on: <strong>${l.text}</strong></p>
      <div class="btn-row">
        <button
          type="button"
          class="btn btn-primary"
          data-next-job
          data-focus="next-job"
        >
          ${f("arrowRight")} Start this job
        </button>
        <button type="button" class="btn" data-print>
          ${f("printer")} Print summary
        </button>
        <a class="btn" href="/solve/" data-link>Learn something else</a>
      </div>
    </section>
  </section>`}const us=[{id:"overview",label:"Safety"},{id:"tools",label:"Tools"},{id:"prep",label:"Prepare"},{id:"steps",label:"Steps"},{id:"finish",label:"Test & finish"}],Et=[{kind:"simpler",label:"Explain more simply",icon:"lightbulb"},{kind:"example",label:"Show another example",icon:"sparkle"},{kind:"stuck",label:"I’m stuck",icon:"help",note:!0},{kind:"different",label:"Something looks different",icon:"eye",note:!0}],ps={simpler:"Explained more simply",example:"Another example",stuck:"Help when stuck",different:"When something looks different",photo:"Progress photo feedback",checkpoint_no:"Checkpoint not confirmed"},At=e=>`${e.safetyDone?"":"Complete the safety checklist first. "}${e.prepDone?"":"Tick every preparation item to unlock the steps."}`;function hs(e,{id:a}){const t=R.getItem(a);if(!t||t.kind!=="task")return fe(e);me(t.title);const s=new AbortController,o=[];let n=!1,l=null;const c={},i=()=>R.saveItem(t),d=(y,m,E)=>r` <ul class="checklist">
        ${m.map((P,D)=>r` <li>
              <label class="check" for="chk-${y}-${D}">
                <input
                  type="checkbox"
                  id="chk-${y}-${D}"
                  data-check="${y}"
                  data-index="${D}"
                  ${t.checks[y][D]?T("checked"):""}
                />
                <span class="check-text">${E(P)}</span>
              </label>
            </li>`)}
      </ul>`,p=y=>r` <ol class="stage-nav no-print" aria-label="Task stages">
        ${us.map((m,E)=>{const P=m.id==="steps"&&!y.canStartSteps||m.id==="finish"&&!y.canFinish,D={overview:y.safetyDone,prep:y.prepDone,steps:y.stepsDone,finish:t.status==="complete"}[m.id];return r`<li>
            <button
              type="button"
              data-stage="${m.id}"
              class="${D?"done":""}"
              ${t.stage===m.id?T('aria-current="step"'):""}
              ${P?T('aria-disabled="true"'):""}
            >
              <span class="num"
                >${D?f("check","icon-inline"):E+1}</span
              >${m.label}${P?r`<span class="visually-hidden"> (locked)</span>`:""}
            </button>
          </li>`})}
      </ol>`,u=(y,m)=>r` <section class="card" aria-labelledby="ov-title">
          <h2 id="ov-title">Before you start</h2>
          <p><strong>Goal:</strong> ${y.goal}</p>
          ${y.estimatedTime?r`<p class="flex">
                  ${f("clock","icon-inline")}
                  <span
                    ><strong>Estimated time:</strong> ${y.estimatedTime}</span
                  >
                </p>`:""}
          ${Ut(t.rating,y.ratingReason)}
          <div class="mt-2">${Ye(y)}</div>
        </section>
        ${y.stopConditions.length?r`<section class="card">
                ${U("red",`Stop and contact ${Ve(y.professional)} if:`,r`<ul class="mb-0">
                    ${Z(y.stopConditions)}
                  </ul>`,"stop")}
              </section>`:""}
        <section class="card" aria-labelledby="safety-title">
          <div class="card-title">
            ${f("shield")}
            <h2 id="safety-title">Safety checklist</h2>
          </div>
          <p class="muted">
            Tick each item to confirm. You need to complete this before the
            steps unlock.
          </p>
          ${d("safety",y.safetyChecklist,E=>E)}
          ${t.rating==="amber"?r` <label class="check" for="amber-ack">
                  <input
                    type="checkbox"
                    id="amber-ack"
                    data-amber
                    ${t.amberAck?T("checked"):""}
                  />
                  <span class="check-text"
                    ><strong>I understand this job is rated Amber.</strong> I
                    will stop and get professional help if anything is unclear
                    or differs from the guidance.</span
                  >
                </label>`:""}
          <div class="btn-row end mt-2">
            <button
              type="button"
              class="btn btn-primary"
              data-goto="tools"
              data-focus="next-tools"
            >
              Continue to tools ${f("arrowRight")}
            </button>
          </div>
          <p
            class="small muted mt-1 mb-0"
            id="steps-unlock-hint"
            ${m.safetyDone?T("hidden"):""}
          >
            Steps unlock when the safety checklist is complete.
          </p>
        </section>`,v=y=>r` <section class="card" aria-labelledby="tools-title">
        <div class="card-title">
          ${f("toolbox")}
          <h2 id="tools-title">Tools and materials</h2>
        </div>
        <p class="muted">
          Tick what you have. Check sizes and fittings against your existing
          parts and the manufacturer’s instructions – do not rely on guesses.
        </p>
        ${y.tools.length?r`<h3>Tools</h3>
                ${d("tools",y.tools,m=>r`<span class="tool-row">${T($t(m.name))}<span>${m.name}${m.note?r`<span class="note">${m.note}</span>`:""}</span></span>`)}`:""}
        ${y.materials.length?r`<h3>Materials</h3>
                ${d("materials",y.materials,m=>r`<span class="tool-row">${T($t(m.name))}<span>${m.name}${m.note?r`<span class="note">${m.note}</span>`:""}</span></span>`)}`:""}
        <div class="btn-row between mt-2">
          <button type="button" class="btn" data-goto="overview">
            ${f("arrowLeft")} Back
          </button>
          <button
            type="button"
            class="btn btn-primary"
            data-goto="prep"
            data-focus="next-prep"
          >
            Continue to preparation ${f("arrowRight")}
          </button>
        </div>
      </section>`,$=(y,m)=>r` <section class="card" aria-labelledby="prep-title">
        <div class="card-title">
          ${f("droplet")}
          <h2 id="prep-title">Preparation</h2>
        </div>
        <p class="muted">
          Do these before the first step, including isolating water or power
          where it applies. Tick each one when done.
        </p>
        ${d("prep",y.preparation,E=>r`<strong>${E.title}</strong><span class="note">${E.detail}</span>`)}
        ${U("amber","If isolation does not work",r`<p class="mb-0">If a valve or stop tap does not fully stop the water (or the power cannot be safely isolated), stop here and contact ${Ve(y.professional)}.</p>`)}
        <div class="btn-row between mt-2">
          <button type="button" class="btn" data-goto="tools">
            ${f("arrowLeft")} Back
          </button>
          <button
            type="button"
            class="btn btn-primary"
            id="start-steps-btn"
            data-goto="steps"
            data-focus="next-steps"
            ${m.canStartSteps?"":T('aria-disabled="true"')}
          >
            Start the steps ${f("arrowRight")}
          </button>
        </div>
        <p
          class="small muted mt-1 mb-0"
          id="steps-locked"
          ${m.canStartSteps?T("hidden"):""}
        >
          ${At(m)}
        </p>
      </section>`,b=(y,m)=>{var P;const E=y.data;return r` <article
        class="card help-response ${E.shouldStop?"stop":""}"
        aria-labelledby="help-${m}"
      >
        <h3 id="help-${m}" tabindex="-1">
          ${ps[y.kind]||"Help"}${y.note?r` <span class="muted small">– “${y.note}”</span>`:""}
        </h3>
        ${E.shouldStop?U("red","Stop here",r`<p class="mb-0">${E.stopReason}</p>`,"stop"):""}
        <p class="pre-wrap">${E.message}</p>
        ${(P=E.bullets)!=null&&P.length?r`<ul>
                ${Z(E.bullets)}
              </ul>`:""}
        ${Ye(E)}
      </article>`},h=y=>{const m=Math.min(t.stepIndex,y.steps.length-1),E=y.steps[m],P=t.stepsDone[m],D=(t.help[m]||[]).slice().reverse(),Y=be(),ue=E.checkpoint&&!P&&c[m]!=="yes";return r` <ol class="step-dots" aria-hidden="true">
          ${y.steps.map((_,C)=>r`<li class="${t.stepsDone[C]?"done":C===m?"current":""}"></li>`)}
        </ol>
        <article class="card step-card" aria-labelledby="step-title">
          <p class="step-count">
            Step ${m+1} of ${y.steps.length}${P?" · completed":""}
          </p>
          <h2 id="step-title" tabindex="-1">${E.title}</h2>
          <p class="step-instruction">${E.instruction}</p>
          <figure class="bp-figure step-figure">
            ${T(Aa(E,m,y.steps.length))}
            <figcaption class="visually-hidden">
              Simplified blueprint-style diagram. Always follow the written
              instructions and your product’s manual.
            </figcaption>
          </figure>
          ${E.warning?U("amber","Take care",r`<p class="mb-0">${E.warning}</p>`):""}
          ${E.tip?U("info","Tip",r`<p class="mb-0">${E.tip}</p>`,"lightbulb"):""}
          ${E.detail?r`<details class="disclosure">
                  <summary>More detail</summary>
                  <div><p class="pre-wrap mb-0">${E.detail}</p></div>
                </details>`:""}
          ${E.checkpoint&&!P?r` <div
                  class="checkpoint"
                  role="group"
                  aria-labelledby="cp-title"
                >
                  <h3 id="cp-title">${f("flag")} Checkpoint</h3>
                  <p>
                    ${E.checkpointQuestion||"Can you confirm this step went as described?"}
                  </p>
                  ${c[m]==="yes"?r`<p class="mb-0">
                          <strong
                            >${f("check","icon-inline")} Confirmed.</strong
                          >
                          You can continue.
                        </p>`:r` <div class="btn-row">
                          <button
                            type="button"
                            class="btn btn-primary"
                            data-checkpoint="yes"
                            data-focus="cp-yes"
                          >
                            Yes, confirmed
                          </button>
                          <button
                            type="button"
                            class="btn"
                            data-checkpoint="no"
                            data-focus="cp-no"
                            ${Y?T("disabled"):""}
                          >
                            No, not yet <span class="cost">(1 request)</span>
                          </button>
                        </div>`}
                </div>`:""}

          <div class="btn-row between mt-2">
            <button
              type="button"
              class="btn"
              data-step-nav="back"
              data-focus="back"
            >
              ${f("arrowLeft")} Go back
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-step-nav="continue"
              data-focus="continue"
              ${ue?T('aria-disabled="true" aria-describedby="cp-title"'):""}
            >
              ${P?"Continue":m===y.steps.length-1?"Mark complete & finish":"Mark complete & continue"}
              ${f("arrowRight")}
            </button>
          </div>
        </article>

        <section class="card no-print" aria-labelledby="help-title">
          <h2 id="help-title" class="h3">Need help with this step?</h2>
          ${te()>0?r`<p class="small muted">Each help request uses 1 of your free daily requests.</p>`:ut({compact:!0})}
          <div class="help-grid">
            ${Et.map(_=>r`<button type="button" class="btn btn-sm" data-help="${_.kind}" data-focus="help-${_.kind}" ${Y||te()<=0?T("disabled"):""}>${f(_.icon)} ${_.label}</button>`)}
            <button
              type="button"
              class="btn btn-sm"
              data-photo-toggle
              data-focus="photo-toggle"
              aria-expanded="${n}"
              aria-controls="progress-photo"
            >
              ${f("camera")} Upload a progress photo
            </button>
          </div>
          ${l?r`<div class="mt-2">${U("red","Help could not be loaded",r`<p class="mb-0">${l.message}</p>`)}</div>`:""}
          <div id="progress-photo" ${n?"":T("hidden")} class="mt-2">
            <div id="progress-photo-picker"></div>
            <button
              type="button"
              class="btn btn-primary"
              data-send-photo
              data-focus="send-photo"
              ${!o.length||Y?T("disabled"):""}
            >
              Send photo for feedback <span class="cost">(1 request)</span>
            </button>
          </div>
        </section>

        <div aria-live="polite">${D.map((_,C)=>b(_,`${m}-${C}`))}</div>

        <section class="card soft">
          ${y.troubleshooting.length?r`<details class="disclosure">
                  <summary>Troubleshooting</summary>
                  <div>
                    ${y.troubleshooting.map(_=>r`<p><strong>${_.problem}</strong><br />${_.solution}</p>`)}
                  </div>
                </details>`:""}
          ${y.stopConditions.length?r`<details class="disclosure">
                  <summary>When to stop</summary>
                  <div>
                    <ul class="mb-0">
                      ${Z(y.stopConditions)}
                    </ul>
                  </div>
                </details>`:""}
        </section>`},w=(y,m)=>t.status==="complete"?ds(t):r` <section class="card" aria-labelledby="test-title">
            <div class="card-title">
              ${f("checkCircle")}
              <h2 id="test-title">Testing and completion checklist</h2>
            </div>
            <p class="muted">
              Work through each check carefully. If any check fails, use the
              troubleshooting tips or stop and ask a professional.
            </p>
            ${d("completion",y.completionChecklist,E=>E)}
            ${U("info","",r`<p class="mb-0">${rt}</p>`,"info")}
            <div class="btn-row between mt-2">
              <button type="button" class="btn" data-goto="steps">
                ${f("arrowLeft")} Back to steps
              </button>
              <button
                type="button"
                class="btn btn-primary"
                id="complete-btn"
                data-complete
                data-focus="complete"
                ${m.completionDone?"":T('aria-disabled="true"')}
              >
                ${f("check")} Mark job as complete
              </button>
            </div>
          </section>`,A=y=>r` <nav class="breadcrumb no-print" aria-label="Breadcrumb">
          <a href="/solve/saved" data-link
            >${f("arrowLeft","icon-inline")} My learning</a
          >
        </nav>
        <header class="mb-2">
          <p class="eyebrow">Practical task</p>
          <h1>${t.title}</h1>
          <div class="flex mb-2">
            ${le(t.rating)}
            ${t.plan.estimatedTime?r`<span class="badge">${f("clock","icon-inline")} ${t.plan.estimatedTime}</span>`:""}
            <span class="small muted">Saved automatically in this browser</span>
          </div>
          ${ge(et(t),"Overall progress")}
        </header>
        ${p(y)}`,k=()=>{const y=t.plan,m=Ee(t);t.stage==="steps"&&!m.canStartSteps&&(t.stage="prep"),t.stage==="finish"&&!m.canFinish&&(t.stage="steps");const E={overview:u,tools:v,prep:$,steps:h,finish:w}[t.stage]||u;if(j(e,r`<div id="task-head">${A(m)}</div>
            <div id="task-body">${E(y,m)}</div>`),t.stage==="steps"){const P=e.querySelector("#progress-photo-picker");P&&dt(P,o,{max:1,label:"Progress photo",onChange:()=>ae(e,k)})}},S=()=>{const y=Ee(t);j(e.querySelector("#task-head"),A(y));const m=e.querySelector("#steps-unlock-hint");m&&(m.hidden=y.safetyDone);const E=e.querySelector("#start-steps-btn");E&&(y.canStartSteps?E.removeAttribute("aria-disabled"):E.setAttribute("aria-disabled","true"));const P=e.querySelector("#steps-locked");P&&(P.hidden=y.canStartSteps,P.textContent=At(y));const D=e.querySelector("#complete-btn");D&&(y.completionDone?D.removeAttribute("aria-disabled"):D.setAttribute("aria-disabled","true"))},q=(y,m="h2")=>{var P,D,Y;const E=Ee(t);if(y==="steps"&&!E.canStartSteps){W(E.safetyDone?"Please complete every preparation item first.":"Please complete the safety checklist first.");return}if(y==="finish"&&!E.canFinish){W("Please complete all the steps first.");return}t.stage=y,i(),k(),(D=(P=e.querySelector(`.card ${m}`))==null?void 0:P.focus)==null||D.call(P),(Y=e.querySelector(".stage-nav"))==null||Y.scrollIntoView({block:"start"})},B=async(y,m,E="",P=[])=>{if(be())return;const D=t.stepIndex,Y=t.plan.steps[D];l=null;const ue=lt(m,"Thinking…");e.querySelectorAll('[data-help],[data-send-photo],[data-checkpoint="no"]').forEach(_=>{_!==m&&(_.disabled=!0)});try{const _=await we("step_help",{mode:"practical",images:P,context:{helpType:y,taskTitle:t.title,goal:t.plan.goal,stepIndex:D,stepTitle:Y.title,stepInstruction:`${Y.instruction}
${Y.detail||""}`.slice(0,H.MAX_CONTEXT_CHARS),note:E}});t.help[D]=t.help[D]||[],t.help[D].push({kind:y,note:E,data:_.data,at:Date.now()}),i(),y==="photo"&&(ve(o),o.length=0,n=!1),k();const C=e.querySelector(".help-response h3");C==null||C.focus(),C==null||C.scrollIntoView({block:"center"})}catch(_){ue(),l=_ instanceof K&&_.code.startsWith("DAILY_LIMIT")?null:_,ae(e,k)}},de=async(y,m)=>_e({title:y,body:r`<div class="field">
          <label for="help-note">${m}</label>
          <textarea
            id="help-note"
            maxlength="${H.MAX_ANSWER_CHARS}"
            rows="4"
          ></textarea>
          <p class="hint">
            Optional, but a short description helps. Up to
            ${H.MAX_ANSWER_CHARS} characters.
          </p>
        </div>`,actions:[{label:"Cancel",value:null},{label:"Get help (1 request)",variant:"primary",value:E=>E.querySelector("#help-note").value.trim()}],dismissValue:null});return e.addEventListener("change",y=>{const m=y.target;m.dataset.check?(t.checks[m.dataset.check][Number(m.dataset.index)]=m.checked,i(),S()):m.matches("[data-amber]")&&(t.amberAck=m.checked,i(),S())},{signal:s.signal}),e.addEventListener("click",async y=>{var E,P,D,Y,ue,_;const m=y.target.closest("button");if(m){if(m.dataset.stage)return q(m.dataset.stage);if(m.dataset.goto)return q(m.dataset.goto);if(m.dataset.checkpoint==="yes"){c[t.stepIndex]="yes",ae(e,k),(E=e.querySelector('[data-step-nav="continue"]'))==null||E.focus();return}if(m.dataset.checkpoint==="no")return B("checkpoint_no",m,"I answered no to the checkpoint question.");if(m.dataset.stepNav==="back"){t.stepIndex>0?(t.stepIndex-=1,i(),k(),(P=e.querySelector("#step-title"))==null||P.focus()):q("prep");return}if(m.dataset.stepNav==="continue"){const C=t.stepIndex;if(t.plan.steps[C].checkpoint&&!t.stepsDone[C]&&c[C]!=="yes"){W("Please answer the checkpoint question first."),(D=e.querySelector('[data-checkpoint="yes"]'))==null||D.focus();return}t.stepsDone[C]=!0,l=null,C<t.plan.steps.length-1?(t.stepIndex=C+1,i(),k(),(Y=e.querySelector("#step-title"))==null||Y.focus(),(ue=e.querySelector(".step-dots"))==null||ue.scrollIntoView({block:"start"})):(i(),q("finish"));return}if(m.dataset.help){const C=Et.find(Vt=>Vt.kind===m.dataset.help);let He="";return C.note&&(He=await de(C.label,C.kind==="stuck"?"What is happening? (for example, “the nut will not turn”)":"What looks different? (for example, “there are no isolation valves”)"),He===null)?void 0:B(C.kind,e.querySelector(`[data-help="${C.kind}"]`),He)}if(m.matches("[data-photo-toggle]")){n=!n,ae(e,k);return}if(m.matches("[data-send-photo]")){if(!o.length)return;if(!await it()){W("Photo not sent.");return}return B("photo",m,"",nt(o))}if(m.matches("[data-complete]")){if(!Ee(t).completionDone){W("Please tick every item in the completion checklist first.");return}t.status="complete",t.completedAt=Date.now(),i(),k(),(_=e.querySelector("#done-title"))==null||_.focus();return}if(m.dataset.stars){t.feedback={stars:Number(m.dataset.stars),at:Date.now()},i(),ae(e,k),W("Thanks – your rating is saved on this device.");return}if(m.dataset.nextJob!==void 0){const C=Wt(t);O.homeRequest=C.text,O.homeMode="practical",oe("/");return}m.matches("[data-print]")&&window.print()}},{signal:s.signal}),k(),()=>{s.abort(),ve(o)}}const qt="aptosolve:welcomed",bs=()=>{const e=H.DAILY_REQUEST_LIMIT,a=Array.from({length:e},(t,s)=>`<circle cx="${14+s*22}" cy="24" r="8" fill="none" stroke="${M.cyan}" stroke-width="1.6"/><path d="M${10+s*22} 24l3 3 5-6" stroke="#fff" stroke-width="1.6" fill="none"/>`).join("");return`<svg class="bp-mini" viewBox="0 0 ${e*22+6} 48" role="img" aria-label="${e} requests a day">${a}<text x="${(e*22+6)/2}" y="46" text-anchor="middle" font-size="7" fill="${M.cyan}" font-family="ui-monospace,monospace">PER DAY</text></svg>`},ms=()=>'<svg class="bp-mini" viewBox="0 0 64 60" role="img" aria-label="Green, amber and red lights"><rect x="4" y="2" width="22" height="56" rx="5" fill="none" stroke="#fff" stroke-width="1.6"/>'+[["#e05252","✕","RED"],["#f2b01e","!","AMBER"],["#3fb067","✓","GREEN"]].map(([e,a,t],s)=>`<circle cx="15" cy="${12+s*18}" r="7" fill="${e}" stroke="#fff" stroke-width="1"/><text x="15" y="${15.5+s*18}" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${a}</text><text x="32" y="${15+s*18}" font-size="7" fill="${M.cyan}" font-family="ui-monospace,monospace">${t}</text>`).join("")+"</svg>",gs=()=>`<svg class="bp-mini" viewBox="0 0 64 48" role="img" aria-label="Saved on this device"><rect x="12" y="4" width="40" height="30" rx="2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M6 40h52l-4-6H10z" fill="none" stroke="#fff" stroke-width="1.6"/><rect x="26" y="15" width="12" height="10" rx="1" fill="none" stroke="${M.cyan}" stroke-width="1.4"/><path d="M28 15v-3a4 4 0 0 1 8 0v3" fill="none" stroke="${M.cyan}" stroke-width="1.4"/></svg>`;function fs(){var s;let e=!1;try{e=localStorage.getItem(qt)==="1"}catch{return}if(e||(location.pathname.replace(/^\/solve(?=\/|$)/,"")||"/")!=="/")return;const a=()=>{try{localStorage.setItem(qt,"1")}catch{}},t=r`<p class="muted">Three things to know before you start:</p>
    <ol class="welcome-cards">
      <li class="welcome-card">
        <div class="bp-chip">${T(ms())}</div>
        <div>
          <h3>Green, Amber, Red</h3>
          <p>
            <strong>Green</strong> – fine to do yourself.
            <strong>Amber</strong> – doable with extra care and checks.
            <strong>Red</strong> – we won’t guide it; we’ll tell you who to call
            (for example a Gas Safe registered engineer).
          </p>
        </div>
      </li>
      <li class="welcome-card">
        <div class="bp-chip">${T(bs())}</div>
        <div>
          <h3>${H.DAILY_REQUEST_LIMIT} free requests a day</h3>
          <p>
            Each new guide, course or extra help uses one. Your count resets
            every day – the badge at the top shows how many are left.
          </p>
        </div>
      </li>
      <li class="welcome-card">
        <div class="bp-chip">${T(gs())}</div>
        <div>
          <h3>Saved on this device only</h3>
          <p>
            There’s no account. Your guides and courses stay in this browser –
            use Progress to download a copy.
          </p>
        </div>
      </li>
    </ol>`;a(),_e({title:"Welcome to APTO Solve",body:t,actions:[{label:"Got it – let’s start",value:!0,variant:"primary"}]}).then(()=>{var o,n;return(n=(o=document.getElementById("request"))==null?void 0:o.focus)==null?void 0:n.call(o)}),(s=document.querySelector(".modal"))==null||s.classList.add("welcome-modal")}Q("/",Qa,"");Q("/start",is,"Personalise");Q("/refused",os,"Safety decision");Q("/task/:id",hs,"Practical task");Q("/course/:id",Ga,"Course");Q("/course/:id/lesson/:n",es,"Lesson");Q("/course/:id/final",Xa,"Final assessment");Q("/course/:id/certificate",Wa,"Certificate");Q("/progress",ss,"Progress");Q("/saved",as,"My learning");Q("/safety",Ba,"Safety information");Q("/privacy",Ua,"Privacy");Q("/how-it-works",Fa,"How it works");ga(fe);const ie=document.querySelector(".menu-toggle"),he=document.getElementById("site-nav");ie==null||ie.addEventListener("click",()=>{var a;const e=ie.getAttribute("aria-expanded")!=="true";ie.setAttribute("aria-expanded",String(e)),he.classList.toggle("open",e),e&&((a=he.querySelector("a"))==null||a.focus())});document.addEventListener("keydown",e=>{e.key==="Escape"&&(he!=null&&he.classList.contains("open"))&&(he.classList.remove("open"),ie.setAttribute("aria-expanded","false"),ie.focus())});R.subscribe(()=>$e());$e();ya();ma();const It=()=>setTimeout(fs,400);document.readyState==="complete"?It():addEventListener("load",It,{once:!0});
