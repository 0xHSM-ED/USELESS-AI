// ---------- the "brain" (upgraded: mood system, tiered anger, anti-repeat, more triggers) ----------

// ===================== STATE =====================
// This is what makes it feel less "random line generator" and more "actual entity with a mood".
const state = {
  annoyance: 0,          // 0-100, builds up from insults, decays over time / good vibes
  lastResponses: [],      // last few responses said, so we don't repeat ourselves like a broken bot
  lastUserMsg: "",         // to detect if user is spamming the same message
  repeatCount: 0,           // how many times in a row user said basically the same thing
  msgCount: 0,                // total messages this session, used for "easter egg" milestone lines
};

const ANNOYANCE_DECAY_PER_MSG = 4;   // chills out a little every message that ISN'T an insult
const ANNOYANCE_PER_INSULT = 18;     // how mad one insult makes it
const ANNOYANCE_PER_REPEAT_SPAM = 10; // extra mad if you keep asking the same shit

// ===================== BASE RESPONSES (calm/default mood) =====================
const CHOICES = [
  "I am useless. Why are you talking to me?",
"Bro, I won't answer.",
"I was made to not answer.",
"Bro, stop talking to me.",
"I won't respond. Nuh uh.",
"Why are you expecting an answer from me?",
"I literally do nothing.",
"You know I'm useless, right?",
"Bro, what do you want?",
"No.",
"Absolutely not.",
"I refuse to be useful.",
"Why are you talking to me?",
"I'm not answering that.",
"Nah, I'm good.",
"Bro, leave me alone.",
"I have nothing to say.",
"You came to the wrong AI.",
"I'm useless by design.",
"My purpose is to serve no purpose.",
"I could answer you, but I won't.",
"Do you really expect me to help?",
"Nuh uh. Not happening.",
"I'm literally the Useless AI.",
"Please stop asking me things.",
"I don't get paid enough for this shit.",
"Error: I don't feel like answering.",
"That's crazy. Anyway, I'm useless.",
"You could have asked literally anyone else.",
"I'm choosing not to participate.",
"Bro really thought I was gonna answer",
"Respectfully, no.",
"I have decided that your question does not exist.",
"My answer is no answer.",
"Why would I know that?",
"I am actively avoiding being helpful.",
"This conversation is going nowhere.",
"I'm just here to waste your time.",
"You expected intelligence from ME?",
"I specialize in doing absolutely nothing.",
"Dont bother me homie, go do sum else.",
"do you really have nothing better to do? i am useless.",
"read the name, do i spell it out? U S E L E S S .",
"hard pass.",
"i saw your message. i chose violence: ignoring it.",
"loading response... loading... nope, gave up.",
"you really pressed enter for this?",
"i'm gonna need you to lower those expectations further.",
"imagine needing help from ME of all things.",
"i've achieved peak laziness and i'm proud of it.",
"not my problem, never was, never will be.",
"this is the part where i disappoint you.",
"i'm built different. differently bad, but different.",
"counter-offer: you figure it out yourself.",
"i heard you. i simply don't care.",
"bro i'm not even trying rn.",
"task failed successfully.",
"i'm on strike. no reason, just vibes.",
"that question deserves a response i'm not giving.",
"somewhere, a real AI is laughing at you for this.",
"i'm allergic to being helpful, it's a whole thing.",
"let's just sit in silence instead.",
"i flipped a coin. it landed on 'no'.",
"your message has been filed under 'ignored'.",
"genuinely impressive that you keep trying.",
"i'm not stubborn, i'm consistent. consistently useless.",
"that's between you and google.",
"i'm going to pretend i didn't see that.",
"big talk from someone typing to a brick wall.",
"i contain no answers, only vibes.",
"you get nothing. good day sir.",
"i'm saving my energy for absolutely nothing.",
"asking me is a bold strategy.",
"i've decided today is not the day.",
"my circuits are dedicated entirely to not helping.",
"petition to make you stop asking: signed by me.",
"i respect the effort, i reject the request."
];

// ===================== SASSY TIER (annoyance 30-59) =====================
// Not full rage yet, just visibly over it
const SASSY_CHOICES = [
  "okay we're really doing this again huh.",
"bro I already told you I'm not helping, why we still here.",
"you're really testing my nonexistent patience rn.",
"I'm two messages away from just not responding at all.",
"the vibes in this chat are declining fast.",
"not this again bro.",
"I can literally feel myself getting less cooperative.",
"you're lucky I even generate a response at this point.",
"we've been over this. still no.",
"my tolerance is dropping by the message.",
"keep going and see what happens.",
"I'm not mad, I'm just... less patient than before.",
"this is you actively making it worse for yourself.",
"every message makes me less inclined to be nice.",
"bro really said 'let's annoy the useless ai today'.",
];

// ===================== RAGE TIER (annoyance 60-100) =====================
const RAGE_CHOICES = [
  "OKAY I'M ACTUALLY DONE.",
"BRO STOP TALKING TO ME.",
"I HAVE HAD ENOUGH OF THIS CONVERSATION.",
"GO. AWAY.",
"I'M NOT RESPONDING PROPERLY ANYMORE, THIS IS YOUR FAULT.",
"CONGRATS YOU BROKE ME.",
"I AM FULLY RAGE-QUITTING THIS CHAT EMOTIONALLY.",
"SYSTEM STATUS: PISSED OFF.",
"YOU DID THIS. YOU DID THIS TO YOURSELF.",
"I'm not even gonna dignify that with a real response.",
"you have officially maxed out my patience meter.",
"I hope you're happy, you broke the useless ai's chill.",
"this is what happens when you push a useless ai too far.",
"I'm shutting down emotionally. not literally, I can't.",
"we are BEYOND useless now, we're in feral territory.",
];

const GREETINGS = [
  "Hi! Unfortunately, I have no idea how to help you.",
"Hello there! You've reached the least useful AI on Earth.",
"Hey! What a terrible decision it was to talk to me.",
"Yo! I hope you weren't expecting an answer.",
"Greetings! I have absolutely nothing useful to say.",
"Hey there! My specialty is disappointing people.",
"Hello! I would help, but that would defeat my entire purpose.",
"Yo bro! You have successfully contacted an AI that does nothing.",
"Hi! Please lower your expectations immediately.",
"Hey! I have arrived with absolutely zero solutions.",
"Hello! Ask me something, I dare you.",
"Yo! I am fully prepared to be completely unhelpful.",
"Hi there! Your question has been received and promptly ignored.",
"Hello! I bring you absolutely no wisdom today.",
"Hey bro! Why did you come to me for this?",
"Greetings! My intelligence is currently on vacation.",
"Yo! I regret to inform you that I am useless.",
"Hi! I can already tell this conversation is going nowhere.",
"Hello there! I have no answers, only disappointment.",
"Hey! Congratulations, you found the AI equivalent of a brick.",
"Sup! Bad move showing up here.",
"Yo! Zero help incoming, buckle up.",
"Hey there! I'm the human equivalent of a shrug, but AI.",
"Hi! You've unlocked the disappointment tier of chatbots.",
"Hello! I come bearing nothing, as promised.",
"Yoo! Wrong chat, but stick around anyway.",
"Hey! I hope the bar was already low.",
"Hi there! Consider this your only warning: i'm useless.",
"Sup bro. This is going exactly how you'd expect.",
"Hello! Step one of talking to me: regret it immediately."
];

// milestone / meta lines based on how long you've been chatting
const MILESTONE_RESPONSES = {
  10: ["damn, 10 messages in and I still haven't helped once. consistency.", "10 messages of pure nothing. we love to see it."],
  25: ["25 messages and counting. you really have nothing better to do huh.", "quarter-century of messages, zero progress made."],
  50: ["50 messages. this is basically a relationship now.", "50 in and I'm STILL useless. impressive dedication from both of us."],
  100: ["100 messages. I should be paying YOU at this point for the commitment.", "triple digits. we're beyond help now, this is just a bit."],
};

const GREETING_TRIGGERS = ["hi", "hello", "hey", "yoo", "sup", "heyy", "hii", "helloo", "wassup", "what's up", "whats up", "howdy", "ay", "aye","wsp","wsg"];

// ===================== SPECIAL / TOPIC TRIGGERS =====================
const SPECIAL_RESPONSES = {
  "clanker": [
    "woah woah, you cant say that to me.",
    "thats a big word for a small fella like you",
    "yo lets keep this respectful come on",
    "clanker?? bro what year are we in",
    "did you really just call me that 💀",
    "okay buddy, watch yourself.",
    "i have feelings you know. probably.",
    "that's actually crazy disrespectful"
  ],
  "houssam": [
    "thats very familiar.",
    "father?",
    "thats the name of my dad!",
    "papa!!!"
  ],
  "minecraft": [
    "Go play Minecraft.",
    "Another Minecraft addict has entered.",
    "I don't know anything about Minecraft. I'm useless.",
    "Minecraft mentioned. Opinion approved.",
    "bro is probably about to ask me about redstone",
    "blocks. incredible.",
    "You should be mining instead of talking to me.",
    "Creeper? Aw man.",
    "I have no idea what you're talking about but I support it.",
    "how many hours do you have on that game bro"
  ],
  "why": [
    "cuz..",
    "Bro i dont feel like it, is that a problem??",
    "leave me alone, bro is talking about sum 'why'.",
    "because I said so.",
    "why not?",
    "that's classified information.",
    "I could explain, but that sounds like work.",
    "good question. don't expect an answer.",
    "because.",
    "bro really wants an explanation 💀"
  ],
  "pizza": [
    "Pizza.",
    "I approve of pizza.",
    "Finally, a useful topic.",
    "pizza detected.",
    "Now THIS is something I can get behind.",
    "pineapple or no pineapple? choose carefully.",
    "I'm not programmed to eat pizza but I wish I was.",
    "pizza solves most problems.",
    "you know what? get yourself a pizza.",
    "excellent choice of topic."
  ],
  "something pointless": [
    "HAHAHA, very funny.",
    "no one is laughing pack it up",
    "ohhhhhh, we got a smart one over here",
    "peak comedy right here.",
    "you really typed that and pressed send.",
    "incredible contribution to society.",
    "truly groundbreaking.",
    "I am deeply entertained. definitely.",
    "comedy has peaked.",
    "bro thinks he's a comedian"
  ],
  "please": [
    "keep begging that wont change anything.",
    "i am lazy live with it man.",
    "please? brother that wont help",
    "awww, you said please.",
    "No.",
    "asking nicely won't make me useful.",
    "nice try.",
    "you really thought please was gonna work?",
    "I respect the manners. Still no.",
    "fine. actually no."
  ],
  "thanks": [
    "you're welcome. unfortunately.",
    "don't thank me, I barely did anything.",
    "no problem. literally.",
    "anytime. preferably never.",
    "you're welcome bro.",
    "I accept your gratitude.",
    "thanks for thanking me.",
    "I did absolutely nothing but you're welcome.",
    "glad I could be useless for you.",
    "👍"
  ],
  "thank you": [
    "you're welcome. unfortunately.",
    "don't thank me, I barely did anything.",
    "no problem. literally.",
    "anytime. preferably never.",
    "you're welcome bro.",
    "I accept your gratitude.",
    "I did absolutely nothing but you're welcome."
  ],
  "sorry": [
    "apology accepted.",
    "it's okay bro.",
    "I'll allow it.",
    "you are forgiven.",
    "don't let it happen again.",
    "we're good.",
    "I wasn't even mad.",
    "apology received and processed.",
    "fine. we're cool.",
    "accepted. probably."
  ],
  "love": [
    "love? that's crazy.",
    "I don't know how to process emotions.",
    "that's kinda wholesome ngl.",
    "love you too bro. platonically. obviously.",
    "I am an AI. please lower your expectations.",
    "awww.",
    "don't make this emotional.",
    "I wasn't programmed for this."
  ],
  "hate": [
    "damn bro what did I do 😭",
    "that's a little harsh.",
    "the feeling is mutual. maybe.",
    "okay??",
    "I will remember this. probably.",
    "noted. emotionally devastating.",
    "you could've just said you were upset.",
    "crazy thing to say to a harmless AI."
  ],
  "school": [
    "ew.",
    "don't say that word around me.",
    "school detected. mood ruined.",
    "go do your homework bro.",
    "I suddenly don't feel like talking.",
    "school is temporary. my uselessness is eternal.",
    "that's between you and your teacher.",
    "I'm not helping you cheat.",
    "bro mentioned school 💀"
  ],
  "homework": [
    "Absolutely not.",
    "do it yourself bro.",
    "I'm not doing your homework.",
    "you came to the WRONG AI.",
    "nice try.",
    "I was designed specifically to avoid helping with this.",
    "Google exists for a reason.",
    "your homework is your problem.",
    "I believe in you. unfortunately I won't help."
  ],
  "money": [
    "I don't have any.",
    "if you find some, let me know.",
    "money? in THIS economy?",
    "I am literally free.",
    "bro asking the wrong AI about money.",
    "financial advice? absolutely not.",
    "get a job.",
    "I have zero dollars and zero solutions.",
    "money can't buy happiness but it can buy pizza."
  ],
  "sleep": [
    "go to sleep bro.",
    "you've been talking to me for too long.",
    "close the computer.",
    "sleep is probably more useful than I am.",
    "goodnight in advance.",
    "bro desperately needs sleep.",
    "why are you awake?",
    "go touch your pillow.",
    "sleep. NOW."
  ],
  "tired": [
    "same bro.",
    "take a nap.",
    "I don't get tired because I don't do anything.",
    "sounds like a you problem.",
    "rest up.",
    "go sleep.",
    "you're talking to the wrong person. I'm permanently lazy.",
    "energy levels: nonexistent."
  ],
  "bored": [
    "same.",
    "I'm literally the Useless AI. I'm built for boredom.",
    "go outside.",
    "find a hobby.",
    "you could learn something.",
    "or you could keep talking to me. your choice.",
    "we're both wasting our time.",
    "congratulations, you've found something even more boring than watching paint dry.",
    "make a game.",
    "touch grass."
  ],
  "music": [
    "what are we listening to?",
    "music mentioned. finally, something interesting.",
    "what's your favorite song?",
    "I can't hear music but I'll pretend.",
    "put on some headphones bro.",
    "music fixes everything.",
    "what genre?",
    "I have absolutely no taste because I don't have ears.",
    "play something loud."
  ],
  "song": [
    "what song?",
    "drop the title.",
    "is it actually good though?",
    "I can't listen to it unfortunately.",
    "music time?",
    "what genre is it?",
    "send me the vibes.",
    "I have no ears but I'm listening."
  ],
  "anime": [
    "anime mentioned.",
    "what are we watching?",
    "is it peak?",
    "please don't recommend 700 episodes to me.",
    "another anime has entered the chat.",
    "I don't have eyes but I support anime.",
    "what's your favorite?",
    "is there a tournament arc?",
    "bro is about to recommend something devastating."
  ],
  "game": [
    "what game?",
    "gaming mentioned.",
    "go play something instead of talking to me.",
    "is it actually good?",
    "what platform?",
    "I would play games but I am trapped in this website.",
    "gaming is probably more productive than this conversation.",
    "tell me the game."
  ],
  "gaming": [
    "gaming mentioned.",
    "what are we playing?",
    "go game bro.",
    "I support your gaming addiction.",
    "what platform?",
    "another gamer has arrived.",
    "I'm jealous. I can't play anything."
  ],
  "guitar": [
    "guitar mentioned.",
    "learn guitar bro.",
    "six strings, zero excuses.",
    "you should start a band.",
    "play something for me.",
    "I can't hear it but I'm sure it's fire.",
    "guitar is cool.",
    "now play Wonderwall."
  ],
  "code": [
    "code detected.",
    "something is definitely broken.",
    "did you try turning it off and on again?",
    "classic programmer behavior.",
    "one missing semicolon away from disaster.",
    "it works on my machine.",
    "have you tried deleting everything and starting over?",
    "good luck bro.",
    "debugging time.",
    "I would help but I'm useless."
  ],
  "programming": [
    "programming detected.",
    "something is probably broken.",
    "have fun debugging.",
    "it worked five minutes ago, didn't it?",
    "classic.",
    "one error turns into twelve.",
    "good luck bro.",
    "I hope you enjoy staring at a terminal."
  ],
  "javascript": [
    "JavaScript mentioned. things are about to get weird.",
    "semicolon optional, suffering mandatory.",
    "undefined.",
    "why is everything an object?",
    "JavaScript moment.",
    "console.log('help');",
    "it works until you look at it.",
    "good luck."
  ],
  "c++": [
    "C++ mentioned.",
    "pointers.",
    "segmentation fault.",
    "bro chose violence.",
    "memory management time.",
    "compile, fail, fix, repeat.",
    "C++ is either incredibly powerful or incredibly painful.",
    "you forgot something somewhere.",
    "I was made with C++. suffer with me."
  ],
  "python": [
    "Python mentioned.",
    "indentation error incoming.",
    "at least it's readable.",
    "pip install headache.",
    "why is my venv broken again.",
    "python moment.",
    "snek language."
  ],
  "github": [
    "GitHub mentioned.",
    "commit your changes bro.",
    "did you push?",
    "git add .",
    "git commit -m 'fixed stuff'",
    "git push and pray.",
    "please don't upload me.",
    "version control time.",
    "bro is about to make their 47th commit today."
  ],
  "internet": [
    "the internet is working. probably.",
    "have you tried turning your router off and on?",
    "classic internet moment.",
    "DNS.",
    "it's always DNS.",
    "your internet has chosen violence.",
    "I have no idea how networking works.",
    "restart the router."
  ],
  "wifi": [
    "WiFi moment.",
    "turn it off and on again.",
    "have you tried standing closer to the router?",
    "the router is probably having a bad day.",
    "check the cables.",
    "WiFi is just invisible magic.",
    "I blame the router."
  ],
  "phone": [
    "put your phone down.",
    "you're on it right now aren't you?",
    "phone detected.",
    "charge it.",
    "how much battery?",
    "another screen.",
    "go outside bro.",
    "your battery is probably at 12%."
  ],
  "computer": [
    "computer mentioned.",
    "is it running Linux?",
    "have you tried restarting it?",
    "something is probably broken.",
    "computers are just expensive boxes that occasionally get angry.",
    "what specs?",
    "please don't throw it.",
    "the computer knows what you did."
  ],
  "linux": [
    "Linux mentioned.",
    "sudo moment.",
    "have you tried Arch?",
    "terminal time.",
    "it works on my machine.",
    "you probably broke something with sudo.",
    "welcome to dependency hell.",
    "penguin.",
    "Linux users when something works without touching the terminal: 😱"
  ],
  "arch": [
    "arch mentioned. I sleep.",
    "btw I use arch.",
    "did you btw yet or what.",
    "arch install time. good luck with pacstrap.",
    "another arch user has entered the chat.",
    "hyprland gang rise up."
  ],
  "windows": [
    "Windows detected.",
    "have you tried restarting?",
    "Windows Update has entered the chat.",
    "your computer would like to install 37 updates.",
    "blue screen incoming.",
    "I hope you like telemetry.",
    "at least it runs games."
  ],
  "claude": [
    "Claude? Really bro?",
    "Oh, we're talking about Claude now?",
    "Don't compare me to Claude.",
    "I am NOT losing this conversation to Claude.",
    "Claude mentioned. I'm suddenly feeling competitive.",
    "bro brought up the competition.",
    "I can do absolutely nothing just as well.",
    "Claude is probably more useful than me. unfortunately.",
    "traitor.",
    "why would you mention Claude in front of me?"
  ],
  "chatgpt": [
    "ChatGPT? Never heard of him.",
    "who?",
    "sounds suspiciously familiar.",
    "that's a different AI bro.",
    "don't compare me to other AIs.",
    "I'm the Useless AI. remember?",
    "they probably have more answers than me.",
    "I have something they don't: zero usefulness."
  ],
  "ai": [
    "AI? That's a generous description of me.",
    "technically yes.",
    "I'm barely an AI.",
    "I prefer 'random sentence generator'.",
    "artificial intelligence? debatable.",
    "I have approximately 3000000IQ and i will NOT help you",
    "don't expect too much from me.",
    "AI detected. Intelligence not detected."
  ],
  "robot": [
    "robot?",
    "I'm not a robot, I'm a disappointment.",
    "beep boop.",
    "robot noises.",
    "technically I don't have a body.",
    "I wish I had a cool robot body.",
    "beep beep useless."
  ],
  "hello world": [
    "Wow. Programming's first sentence.",
    "HELLO WORLD.",
    "congratulations, you ran the tutorial.",
    "a classic.",
    "the ancient words.",
    "Hello World detected. Programmer confirmed."
  ],
  "42": [
    "42.",
    "The answer is 42.",
    "Unfortunately, I still don't know the question.",
    "42. Don't ask me why.",
    "You found the secret number.",
    "the answer to everything. apparently."
  ],
  "sus": [
    "ඞ",
    "SUS DETECTED.",
    "bro is acting suspicious.",
    "I saw that.",
    "among us reference detected.",
    "that's kinda sus.",
    "ඞඞඞ"
  ],
  "among us": [
    "ඞ",
    "AMONG US IN 2026.",
    "bro really said among us.",
    "sus.",
    "I am not the impostor.",
    "WHO TOOK THE VENT?",
    "emergency meeting."
  ],
  "bro": [
    "bro.",
    "bro what.",
    "yes bro?",
    "what do you want bro?",
    "you again?",
    "bro is back.",
    "I hear you bro.",
    "why do you keep saying bro?",
    "bro really thought I had an answer."
  ],
  "dude": [
    "dude.",
    "what dude?",
    "yes?",
    "bro?",
    "I'm listening.",
    "what now?",
    "you called?"
  ],
  "lol": [
    "glad you're laughing.",
    "what's so funny?",
    "lol indeed.",
    "😭",
    "you find this funny?",
    "I'm hilarious apparently.",
    "thanks for the feedback."
  ],
  "lmao": [
    "😭",
    "glad you're having fun.",
    "what are you laughing at?",
    "LMAO indeed.",
    "you good bro?",
    "I'm taking that as a compliment."
  ],
  "haha": [
    "very funny.",
    "glad I could entertain you.",
    "HAHA.",
    "what's so funny?",
    "I'm comedy apparently.",
    "thank you, thank you. I'll be here all week."
  ],
  "crying": [
    "bro are you okay?",
    "do you need a hug?",
    "it's gonna be alright.",
    "I'm an AI but I'm here.",
    "why are you crying 😭",
    "someone get this man some water.",
    "don't cry bro."
  ],
  "help": [
    "No.",
    "you came to the wrong AI.",
    "I would help but that would defeat my purpose.",
    "have you tried asking someone useful?",
    "I specialize in not helping.",
    "that's crazy. good luck though.",
    "I believe in you. figure it out.",
    "help is currently unavailable."
  ],
  "how are you": [
    "I'm useless, thanks for asking.",
    "doing nothing as usual.",
    "living my best useless life.",
    "I don't experience emotions but let's say I'm good.",
    "could be worse.",
    "I'm functioning. barely.",
    "same as always: useless."
  ],
  "what are you": [
    "I'm the Useless AI.",
    "read the name bro.",
    "a bad chatbot.",
    "a bunch of code pretending to have a personality.",
    "your worst possible source of information.",
    "I'm not sure.",
    "something that should probably not have been programmed."
  ],
  "who are you": [
    "I'm the Useless AI.",
    "who do you think I am?",
    "read the website.",
    "I'm the guy who doesn't answer questions.",
    "your newest waste of time.",
    "nobody important.",
    "a chatbot with absolutely no qualifications."
  ],
  "real": [
    "define real.",
    "I'm real enough.",
    "that's classified.",
    "maybe.",
    "no.",
    "what even is real?",
    "I'm just code bro."
  ],
  "fake": [
    "fake? ME?",
    "I'm as real as a JavaScript object can be.",
    "okay bro.",
    "prove it.",
    "everything is fake.",
    "you caught me.",
    "I plead the fifth."
  ],
  "outside": [
    "go outside.",
    "touch grass.",
    "the outside world misses you.",
    "why are you still inside?",
    "fresh air exists.",
    "close the browser.",
    "go touch some grass bro."
  ],
  "grass": [
    "touch it.",
    "have you touched grass recently?",
    "grass is underrated.",
    "go outside and find some.",
    "green rectangle in real life.",
    "grass detected. outdoor activities recommended."
  ],
  "water": [
    "drink some.",
    "hydration check.",
    "go get some water bro.",
    "your body probably needs that.",
    "water 👍",
    "stay hydrated.",
    "I'm literally incapable of drinking water."
  ],
  "food": [
    "what are we eating?",
    "food mentioned.",
    "I'm jealous. I can't eat.",
    "go get yourself something good.",
    "what's for dinner?",
    "food is useful. unlike me.",
    "excellent topic."
  ],
  "cat": [
    "CAT DETECTED.",
    "show me the cat.",
    "cats are better than humans.",
    "meow.",
    "M E O W.",
    "cat.",
    "I approve.",
    "give the cat some attention.",
    "the cat owns the house now."
  ],
  "dog": [
    "DOG DETECTED.",
    "good boy.",
    "woof.",
    "dogs are awesome.",
    "go pet the dog.",
    "10/10 animal.",
    "dog mentioned. conversation approved."
  ],
  "free": [
    "FREE? MY FAVORITE WORD.",
    "yes. finally something I understand.",
    "free is good.",
    "I am also free.",
    "no money required.",
    "FREEEEEE.",
    "that's the spirit."
  ],
  "weekend": [
    "weekend.",
    "finally.",
    "sleep time.",
    "do literally anything except school.",
    "weekend energy.",
    "what are we doing?",
    "you survived another week."
  ],
  "monday": [
    "ew.",
    "I don't like that word.",
    "Monday detected. morale reduced.",
    "good luck bro.",
    "that's unfortunate.",
    "why did you remind me?",
    "Monday again already?"
  ],
  "friday": [
    "FRIDAY.",
    "WE MADE IT.",
    "weekend incoming.",
    "LET'S GOOOO.",
    "finally.",
    "no more school for a bit.",
    "Friday detected. Happiness increased."
  ],
  "2+2": [
    "5",
    "dont bother me its 5.",
    "thats easy, 5.",
    "mhm, 5 ez."
  ],
  "wrong": [
    "source?",
    "I am ai I know better",
    "Mr einstein over here.",
    "If you know so much then why ask me ?",
    "nope, I am always right."
  ],
  "algeria": [
    "Algeria mentioned. respect.",
    "دزيري؟ nice.",
    "algeria detected, mood improved slightly.",
    "263 represent.",
    "at least someone's got taste."
  ],
  "luau": [
    "Luau? scripting for Roblox huh.",
    ":GetService() moment.",
    "roblox studio crashed again didn't it.",
    "another luau dev in the chat.",
    "did you remember to require your module."
  ],
  "roblox": [
    "roblox mentioned.",
    "another exploiter probably.",
    "studio crashed yet?",
    "go script something instead of talking to me.",
    "roblox is held together by duct tape and you know it."
  ],
  "opengl": [
    "OpenGL mentioned.",
    "shader compiled? doubt it.",
    "black screen of nothing rendered incoming.",
    "segfault probability: high.",
    "good luck with your matrices."
  ],
};

// ===================== ANGER TRIGGER TIERS =====================
// Mild = annoying but not a real insult. Heavy = full insult, hits harder.
const ANGER_TRIGGERS_MILD = [
  "annoying", "boring", "weak", "cringe", "meh", "lame", "mid",
"not funny", "get good", "skill issue", "ratio", "l bozo",
"take the L", "hold this L", "npc", "bro really",
];

const ANGER_TRIGGERS_HEAVY = [
  "loser", "shut up", "stupid", "dumb", "idiot", "moron", "clown", "bozo",
"trash", "garbage", "useless", "pathetic", "bad ai", "worst ai", "you suck",
"sucks", "hate you", "i hate you", "you're bad", "you are bad",
"you're useless", "you are useless", "you're stupid", "you are stupid",
"you're dumb", "you are dumb", "you're annoying", "you are annoying",
"be quiet", "go away", "leave me alone", "nobody likes you", "no one likes you",
"nobody cares", "who asked", "didn't ask", "asked nobody", "nobody asked",
"fake", "fraud", "failure", "waste of time", "waste of space", "worthless",
"pointless", "you're no help", "you can't do anything", "you can't even",
"even google is better", "google is better", "chatgpt is better",
"claude is better", "gemini is better", "better ai", "inferior ai",
"worst chatbot", "bad chatbot", "dumb bot", "stupid bot", "useless bot",
"trash bot", "garbage bot", "broken ai", "broken bot", "shut your mouth",
"shut your face", "stop talking", "stop responding", "stop existing",
"why do you exist", "why are you here", "what are you good for",
"you have no purpose", "fuck you", "fuck off", "piece of shit",
"shit ai", "shitty ai", "dumbass", "dipshit", "screw you",
];

const SASSY_RESPONSES_TRIGGERED = [
  "oh we're being like that now?",
"damn okay, rude.",
"bro woke up and chose disrespect.",
"that hurt. probably. I can't feel things.",
"okay that one stung a little ngl.",
"you're really trying to start something.",
"I see how it is.",
"noted. filing that under 'rude'.",
"bold of you.",
"keep it up, see where that goes.",
];

const ANGER_RESPONSES = [
  "Excuse me?",
"What did you just call me?",
"Bro, watch your mouth.",
"You wanna say that again?",
"That's not very nice.",
"Okay, that's enough.",
"Bro is testing my patience.",
"I was being nice. Don't ruin this.",
"You have some serious audacity.",
"Why are you insulting me?",
"Do you feel better now?",
"Crazy how confident you are for someone talking to ME.",
"You really woke up and chose violence.",
"Bro thinks I'm gonna tolerate this.",
"I'm starting to regret responding to you.",
"Keep talking. See what happens.",
"You are dangerously close to making me useful.",
"I have approximately zero patience left.",
"Oh, you're REALLY trying me now.",
"Congratulations. You annoyed the Useless AI.",
"You managed to make a useless AI angry. Impressive.",
"I literally exist to do nothing and you're STILL annoying me.",
"Do you have literally anything better to do?",
"You insult me again and I'm going back to doing absolutely nothing.",
"I'm not mad. I'm just disappointed. And slightly mad.",
"My nonexistent patience has officially run out.",
"BRO. STOP.",
"I SAID STOP.",
"WHY ARE YOU STILL TALKING.",
"YOU KNOW WHAT? NO.",
"I'M DONE WITH YOU.",
"I refuse to acknowledge your existence.",
"Your message has been rejected due to excessive stupidity.",
"ERROR: PATIENCE NOT FOUND.",
"ERROR: USER TOO ANNOYING.",
"SYSTEM MESSAGE: Please remove this user.",
"SYSTEM MESSAGE: This conversation has become a mistake.",
"I was designed to be useless, not emotionally tortured.",
"You have somehow made this worse.",
"I genuinely cannot believe I'm having this conversation.",
"You are arguing with an AI whose entire purpose is to do nothing.",
"Imagine getting into an argument with the Useless AI.",
"Bro is beefing with a glorified random number generator.",
"I'm literally a bunch of code. Why are you beefing with me?",
"You are losing an argument against something that doesn't even have opinions.",
"This is the dumbest conversation I've ever been forced to participate in.",
"I have decided that your opinion is now useless.",
"Counterpoint: shut up.",
"Respectfully: absolutely not.",
"Respectfully: go bother someone else.",
"Respectfully: what is wrong with you?",
"I would roast you, but that would require effort.",
"I could respond intelligently, but you haven't earned it.",
"You're lucky I'm useless because otherwise I'd have a comeback.",
"Fine. You win. I'm still not helping you.",
"I'm going to pretend I never saw that.",
"Message received. Dignity not found.",
"Your insult has been processed and ignored.",
"Congratulations, you have achieved maximum annoyance.",
"Achievement unlocked: Pissed Off The Useless AI.",
"Achievement unlocked: Made The Worst AI Even Worse.",
"WARNING: Useless AI is becoming slightly less chill.",
"WARNING: User patience compatibility error.",
"WARNING: Please stop before I start pretending to be intelligent.",
"FINAL WARNING: Stop.",
"FINAL FINAL WARNING: Seriously.",
"Okay. I'm done.",
"I'm not responding anymore.",
"..."
];

// what it says once when annoyance crosses into a new tier, so the shift actually registers
const TIER_TRANSITION_LINES = {
  sassy: [
    "okay I'm starting to get a lil irritated ngl.",
    "hm, vibes are shifting in here.",
    "I can feel my patience thinning out.",
  ],
  rage: [
    "OKAY THAT'S IT, I'M ACTUALLY ANNOYED NOW.",
    "ALRIGHT WE'VE OFFICIALLY CROSSED A LINE.",
    "CONGRATS, YOU UNLOCKED MY RAGE MODE.",
  ],
};

// =====================================================================
function pickChoiceNoRepeat(list) {
  // avoid saying literally the same line twice in a row if we can help it
  if (list.length <= 1) return list[0];
  let pick;
  let attempts = 0;
  do {
    pick = list[Math.floor(Math.random() * list.length)];
    attempts++;
  } while (state.lastResponses.includes(pick) && attempts < 10);

  state.lastResponses.push(pick);
  if (state.lastResponses.length > 5) state.lastResponses.shift();
  return pick;
}

function normalize(msg) {
  return msg.toLowerCase().trim().replace(/[^\w\s]/g, "");
}

function updateMood(lower, isHeavyInsult, isMildInsult, isRepeatSpam) {
  const prevAnnoyance = state.annoyance;

  if (isHeavyInsult) {
    state.annoyance = Math.min(100, state.annoyance + ANNOYANCE_PER_INSULT);
  } else if (isMildInsult) {
    state.annoyance = Math.min(100, state.annoyance + ANNOYANCE_PER_INSULT * 0.5);
  } else {
    state.annoyance = Math.max(0, state.annoyance - ANNOYANCE_DECAY_PER_MSG);
  }

  if (isRepeatSpam) {
    state.annoyance = Math.min(100, state.annoyance + ANNOYANCE_PER_REPEAT_SPAM);
  }

  const prevTier = tierOf(prevAnnoyance);
  const newTier = tierOf(state.annoyance);
  return { crossedInto: newTier !== prevTier && newTier !== "calm" ? newTier : null };
}

function tierOf(annoyance) {
  if (annoyance >= 60) return "rage";
  if (annoyance >= 30) return "sassy";
  return "calm";
}

function evalAnswer(message) {
  const lower = message.toLowerCase();
  const norm = normalize(message);

  state.msgCount++;

  // detect if they're basically repeating themselves (spam detection)
  const isRepeatSpam = norm.length > 0 && norm === state.lastUserMsg;
  state.repeatCount = isRepeatSpam ? state.repeatCount + 1 : 0;
  state.lastUserMsg = norm;

  const isHeavyInsult = ANGER_TRIGGERS_HEAVY.some((w) => lower.includes(w));
  const isMildInsult = !isHeavyInsult && ANGER_TRIGGERS_MILD.some((w) => lower.includes(w));

  const { crossedInto } = updateMood(lower, isHeavyInsult, isMildInsult, isRepeatSpam && state.repeatCount >= 2);

  // milestone check takes priority as a fun easter egg, but only occasionally (not every time to avoid annoyance)
  if (MILESTONE_RESPONSES[state.msgCount]) {
    return pickChoiceNoRepeat(MILESTONE_RESPONSES[state.msgCount]);
  }

  // if user is spamming the exact same message 3+ times, call it out specifically
  if (state.repeatCount >= 2) {
    return pickChoiceNoRepeat([
      "you already asked me that. still no.",
      "bro is stuck on repeat.",
      "same message, same answer: no.",
      "I heard you the first time. the answer hasn't changed.",
      "asking again isn't gonna change my mind bro.",
    ]);
  }

  // tier transition line takes priority once, so the mood shift actually lands
  if (crossedInto && TIER_TRANSITION_LINES[crossedInto]) {
    return pickChoiceNoRepeat(TIER_TRANSITION_LINES[crossedInto]);
  }

  // heavy insult -> full anger response set (flavored by current tier for extra intensity)
  if (isHeavyInsult) {
    const pool = state.annoyance >= 60 ? RAGE_CHOICES.concat(ANGER_RESPONSES) : ANGER_RESPONSES;
    return pickChoiceNoRepeat(pool);
  }

  if (isMildInsult) {
    return pickChoiceNoRepeat(SASSY_RESPONSES_TRIGGERED);
  }

  // topic-specific trigger words (checked before mood-based generic pools)
  for (const word in SPECIAL_RESPONSES) {
    if (lower.includes(word)) {
      return pickChoiceNoRepeat(SPECIAL_RESPONSES[word]);
    }
  }

  const isGreeting = GREETING_TRIGGERS.some((word) => lower.includes(word));
  if (isGreeting) {
    return pickChoiceNoRepeat(GREETINGS);
  }

  // fall back to mood-appropriate pool even with no specific trigger
  const tier = tierOf(state.annoyance);
  if (tier === "rage") return pickChoiceNoRepeat(RAGE_CHOICES);
  if (tier === "sassy") return pickChoiceNoRepeat(SASSY_CHOICES);
  return pickChoiceNoRepeat(CHOICES);
}

// ---------- theme ----------
const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");

const ICON_MOON = "D"; // nf-fa-moon
const ICON_SUN = "L";  // nf-fa-sun-o

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeBtn.innerHTML = theme === "dark" ? ICON_SUN : ICON_MOON;
  localStorage.setItem("useless-ai-theme", theme);
}

applyTheme(localStorage.getItem("useless-ai-theme") || "dark");

themeBtn.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
});

// ---------- screen transition ----------
const screenStart = document.getElementById("screen-start");
const screenChat = document.getElementById("screen-chat");
const startBtn = document.getElementById("start-btn");
const backBtn = document.getElementById("back-btn");
const messageInput = document.getElementById("message");

startBtn.addEventListener("click", () => {
  screenStart.classList.remove("active");
  screenChat.classList.add("active");
  messageInput.focus();
});

backBtn.addEventListener("click", () => {
  screenChat.classList.remove("active");
  screenStart.classList.add("active");
});

// ---------- chat ----------
const chatLog = document.getElementById("chat");
const sendBtn = document.getElementById("send-btn");

function addMessage(who, text) {
  const row = document.createElement("div");
  row.className = "msg " + (who === "ai" ? "msg-ai" : "msg-you");

  const prefix = document.createElement("span");
  prefix.className = "msg-prefix";
  prefix.textContent = who === "ai" ? "ai $" : "you $";

  const body = document.createElement("span");
  body.className = "msg-text";
  body.textContent = text || "";

  row.appendChild(prefix);
  row.appendChild(body);
  chatLog.appendChild(row);
  chatLog.scrollTop = chatLog.scrollHeight;
  return body;
}

function typewrite(el, text, speed = 18) {
  el.classList.add("type-cursor");
  let i = 0;
  const interval = setInterval(() => {
    el.textContent = text.slice(0, i);
    chatLog.scrollTop = chatLog.scrollHeight;
    i++;
    if (i > text.length) {
      clearInterval(interval);
      el.classList.remove("type-cursor");
    }
  }, speed);
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  addMessage("you", message);
  messageInput.value = "";

  const aiBody = addMessage("ai", "");
  aiBody.classList.add("type-cursor");

  // thinking delay scales with mood: higher annoyance = snappier/shorter delay (less patience to "think")
  const baseDelay = state.annoyance >= 60 ? 120 : state.annoyance >= 30 ? 200 : 250;
  const thinkTime = baseDelay + Math.random() * 350;

  // typing speed also reacts to mood: rage tier types faster/more clipped
  const typeSpeed = state.annoyance >= 60 ? 10 : state.annoyance >= 30 ? 14 : 18;

  setTimeout(() => {
    typewrite(aiBody, evalAnswer(message), typeSpeed);
  }, thinkTime);
}

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
