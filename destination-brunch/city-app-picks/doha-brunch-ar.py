"""Arabic translations for the Brunch Doha app (Nov 2026). Used by build-doha-brunch-ar.py.
Venue and restaurant names stay in their original (English) form, as in the other Gulf apps."""
import re

NAME = {
 "World of Curries": "عالم الكاري", "Friday Family Brunch": "برانش الجمعة العائلي", "The Weekend Roast": "روست نهاية الأسبوع",
 "Dalchini Social Brunch": "برانش دالتشيني الاجتماعي", "Vamos de Fiesta": "فاموس دي فييستا", "Escape to Tulum": "هروب إلى تولوم",
 "Farmhouse Terrace Brunch": "برانش تراس فارمهاوس", "Royal Thai Brunch": "البرانش التايلاندي الملكي", "DestinAsian Brunch": "برانش ديستن آسيان",
 "Aqua BBQ Brunch": "برانش أكوا للشواء", "Al Liwan Friday Brunch": "برانش الجمعة في الليوان", "Turkish Table Brunch": "برانش المائدة التركية",
 "Family Friday Brunch": "برانش الجمعة العائلي", "Brunch & Play: Family Edition": "برانش ولعب: نسخة العائلة",
 "Friday Brunch & Mini Chef": "برانش الجمعة والشيف الصغير", "Chatuchak Market Brunch": "برانش سوق تشاتوتشاك",
 "Rio Carnival Brunch": "برانش كرنفال ريو", "Sabadão Brunch": "برانش ساباداو", "IKA Friday Brunch": "برانش الجمعة في إيكا",
 "Spanish Brunch": "البرانش الإسباني", "Dim Sum Brunch": "برانش الديم سوم", "Ama Zonia Brunch": "برانش أمازونيا",
 "Malibu California Brunch": "برانش ماليبو كاليفورنيا", "Almuerzos by La Mar": "ألمويرثوس من لا مار", "Medi & Chic Brunch": "برانش ميدي آند شيك",
 "Dare to Brunch": "تجرأ على البرانش", "Curiosa Brunch": "برانش كوريوسا", "Taste of Latin": "مذاق لاتيني", "Sora Rooftop Brunch": "برانش سطح سورا",
 "Elemental Brunch": "برانش إليمنتال", "Kai's Songbird Brunch": "برانش كايز سونغبيرد", "Brunch 61": "برانش 61", "Paradiso Brunch": "برانش باراديسو",
 "Soléa Friday Brunch": "برانش الجمعة في سوليا", "Echoes of Jade": "أصداء اليشم", "Grand Friday Brunch": "برانش الجمعة الكبير",
 "Spice Market Brunch": "برانش سبايس ماركت", "Jamavar Royal Brunch": "برانش جامافار الملكي", "Family Brunch": "برانش عائلي",
 "Bubbalicious Brunch": "برانش بابليشس", "Nobu Brunch": "برانش نوبو", "Samba Brunch": "برانش السامبا", "The St. Regis Grand Brunch": "برانش سانت ريجيس الكبير",
 "The Great Gatsby Brunch": "برانش غاتسبي العظيم", "Baikingu Brunch": "برانش بايكينغو", "NOZOMI Brunch": "برانش نوزومي", "Morimoto Brunch": "برانش موريموتو",
 "Maneki Brunch": "برانش مانيكي", "Siam Brunch": "برانش سيام", "Sawasdee Friday Brunch": "برانش الجمعة سواديكا", "Thai Social Table": "المائدة التايلاندية الاجتماعية",
 "Pan Asian Brunch": "برانش آسيوي", "La Vie En Rosé Brunch": "برانش لا في أون روزيه", "Big Family Brunch": "برانش العائلة الكبيرة",
 "La Famiglia Lunch": "غداء لا فاميليا", "Saturday Roast": "روست السبت", "Brunch by The Bay": "برانش على الخليج", "Il Pranzo": "إل برانزو",
 "Saturday Brunch": "برانش السبت", "La Dolce Vita Brunch": "برانش لا دولتشي فيتا", "Taste of Harry's Brunch": "برانش مذاق هاريز",
 "Fisherman's Brunch": "برانش الصياد", "Marina Brunch": "برانش المارينا", "Weekend Brunch": "برانش نهاية الأسبوع", "Weekend Bites Brunch": "برانش لقمات نهاية الأسبوع",
 "Breakfast & Beyond": "الفطور وأكثر", "Torba Table": "مائدة تربة", "Sabato Brunch": "برانش ساباتو", "Saturday BBQ Brunch": "برانش شواء السبت",
}

CUISINE = {
 "Pan-Asian curry buffet (Filipino, Thai, Korean, Indonesian, Indian)": "بوفيه كاري آسيوي (فلبيني، تايلاندي، كوري، إندونيسي، هندي)",
 "International buffet with live stations": "بوفيه عالمي مع محطات طهي مباشر",
 "British pub roast / BBQ platters": "روست الحانة البريطانية / أطباق الشواء",
 "Indian (live stations, dosa, chaat, biryani)": "هندي (محطات مباشرة، دوسا، شات، برياني)",
 "Peruvian sharing menu": "قائمة بيروفية للمشاركة",
 "Mexican buffet (taco/ceviche/quesadilla stations) + sushi, BBQ": "بوفيه مكسيكي (محطات تاكو وسيفيتشي وكاساديا) مع سوشي وشواء",
 "International buffet": "بوفيه عالمي", "Thai": "تايلاندي",
 "Pan-Asian (Chinese, Vietnamese, Indonesian, Korean, Japanese, Thai)": "آسيوي (صيني، فيتنامي، إندونيسي، كوري، ياباني، تايلاندي)",
 "BBQ / grill + international": "شواء ومشاوي مع أطباق عالمية",
 "Middle Eastern buffet + seafood, grills, carving, sushi": "بوفيه شرق أوسطي مع مأكولات بحرية ومشاوي ومحطة تقطيع وسوشي",
 "Turkish / Levantine (simit, mezze, charcoal kebabs)": "تركي وشامي (سميط، مازة، كباب على الفحم)",
 "International family buffet (circus theme)": "بوفيه عائلي عالمي (بطابع السيرك)",
 "Thai street food, live cooking": "أكل شوارع تايلاندي وطهي مباشر",
 "Brazilian churrasco + food stations": "شوراسكو برازيلي مع محطات طعام",
 "South American sharing set menu": "قائمة ثابتة من أمريكا الجنوبية للمشاركة",
 "Spanish (tapas, paella, grills)": "إسباني (تاباس، باييا، مشاوي)", "Cantonese dim sum": "ديم سوم كانتوني",
 "Latin American & Spanish, jungle theme": "أمريكي لاتيني وإسباني بطابع الغابة",
 "Californian buffet + set dishes": "بوفيه كاليفورني مع أطباق ثابتة",
 "SoCal-inspired buffet (vegan options)": "بوفيه مستوحى من جنوب كاليفورنيا (خيارات نباتية)",
 "Peruvian 5-course tasting (Gaston Acurio)": "قائمة تذوق بيروفية من 5 أطباق (غاستون أكوريو)",
 "Mediterranean": "متوسطي", "Steakhouse": "مطعم ستيك",
 "Latin family-style by Jean-Georges": "أطباق لاتينية عائلية للمشاركة من جان جورج",
 "Modern Japanese + international buffet": "ياباني حديث مع بوفيه عالمي", "Contemporary family-style": "أطباق معاصرة عائلية للمشاركة",
 "Modern Chinese / Nanyang (Kai Mayfair team)": "صيني حديث / نانيانغ (فريق كاي مايفير)", "Pan-Asian / Latin fusion": "مزيج آسيوي ولاتيني",
 "International & regional buffet": "بوفيه عالمي وإقليمي", "International / Greek-Mediterranean": "عالمي / يوناني متوسطي",
 "Regional Chinese sharing plates": "أطباق صينية إقليمية للمشاركة",
 "Polynesian / tropical 3-course set menu": "قائمة بولينيزية استوائية من 3 أطباق",
 "Southeast Asian (Jean-Georges)": "جنوب شرق آسيوي (جان جورج)",
 "Indian fine dining (Michelin-starred chef Surender Mohan)": "مطبخ هندي راقٍ (الشيف سوريندر موهان الحائز على نجمة ميشلان)",
 "American steakhouse buffet": "بوفيه ستيك أمريكي",
 "Japanese-Peruvian (Nobu signatures, sushi, oysters)": "ياباني بيروفي (أطباق نوبو المميزة، سوشي، محار)",
 "Japanese-Brazilian-Peruvian set menu": "قائمة ثابتة يابانية برازيلية بيروفية", "Grand international buffet": "بوفيه عالمي كبير",
 "Steakhouse + caviar": "ستيك مع كافيار", "Contemporary Japanese (sushi, robata grill)": "ياباني معاصر (سوشي، شواء روباتا)",
 "Japanese sharing menu (teppanyaki version also available from QAR 280)": "قائمة يابانية للمشاركة (نسخة تيبانياكي متاحة أيضًا من 280 ر.ق)",
 "Japanese (Iron Chef Morimoto)": "ياباني (الشيف الحديدي موريموتو)", "Chinese dishes with Japanese technique": "أطباق صينية بتقنيات يابانية",
 "Royal Thai, family-style sharing": "تايلاندي ملكي بأطباق عائلية للمشاركة",
 "Pan-Asian (sushi, dim sum, live grills, wok)": "آسيوي (سوشي، ديم سوم، مشاوي مباشرة، ووك)",
 "French Riviera sharing (Provençal eggs, escargots, prawns, sirloin)": "أطباق الريفييرا الفرنسية للمشاركة (بيض بروفنسالي، حلزون، روبيان، سيرلوين)",
 "International buffet with live cooking stations": "بوفيه عالمي مع محطات طهي مباشر",
 "Italian sharing-style family lunch": "غداء عائلي إيطالي للمشاركة", "British Sunday-style roast": "روست على الطريقة البريطانية",
 "International with seafood": "عالمي مع مأكولات بحرية", "Italian family-style": "إيطالي عائلي للمشاركة",
 "International with live BBQ": "عالمي مع شواء مباشر", "Italian": "إيطالي",
 "Mediterranean seafood sharing set menu": "قائمة مأكولات بحرية متوسطية ثابتة للمشاركة", "International": "عالمي",
 "Chinese / Cantonese dim sum": "صيني / ديم سوم كانتوني",
 "New York-style brunch (eggs, pancakes, bakes)": "برانش على طريقة نيويورك (بيض، بانكيك، مخبوزات)",
 "Café brunch (bakery basket, eggs benedict, pancakes, crêpes)": "برانش مقهى (سلة مخبوزات، بيض بنديكت، بانكيك، كريب)",
 "International late breakfast": "فطور متأخر عالمي",
 "Middle Eastern & Mediterranean (with Torba Farm produce)": "شرق أوسطي ومتوسطي (بمنتجات مزرعة تربة)",
 "Italian & Mediterranean": "إيطالي ومتوسطي", "Middle Eastern BBQ": "شواء شرق أوسطي",
}

HIGHLIGHTS = {
 "Cheapest full brunch found; B1G1 on Entertainer/Urban Point/MyBook/QGrabs": "أرخص برانش كامل وجدناه؛ عرض 1+1 على إنترتينر وأوربان بوينت وماي بوك وكيو غرابز",
 "Kids entertainment; kids QAR90, under-6 free; B1G1": "ترفيه للأطفال؛ الأطفال 90 ر.ق ومجاني لمن دون 6 سنوات؛ عرض 1+1",
 "Kids 6-12 QAR 95; add a BBQ platter for QAR 60": "الأطفال 6-12 سنة 95 ر.ق؛ أضف طبق شواء مقابل 60 ر.ق",
 "Live music, shisha; Michelin-selected restaurant": "موسيقى حية وشيشة؛ مطعم مختار من دليل ميشلان",
 "Music + live entertainment; in Time Out Doha best a-la-carte brunch list": "موسيقى وترفيه حي؛ ضمن قائمة تايم آوت الدوحة لأفضل برانش من القائمة",
 "Pool access + live entertainment; After Dark liquid brunch follows 4:30-7:30pm (QAR189)": "دخول المسبح وترفيه حي؛ يليه برانش المشروبات من 4:30 إلى 7:30 م (189 ر.ق)",
 "Pool & beach access included; sister Offsite Marina Brunch from QAR225": "يشمل دخول المسبح والشاطئ؛ وبرانش أوفسايت مارينا الشقيق من 225 ر.ق",
 "Terrace brunch with complimentary pool and beach access": "برانش على التراس مع دخول مجاني إلى المسبح والشاطئ",
 "Billed as award-winning; B1G1 on soft package": "يُوصف بأنه حائز على جوائز؛ عرض 1+1 على باقة المشروبات الغازية",
 "Saturday pan-Asian brunch; pre-booking required": "برانش آسيوي يوم السبت؛ الحجز المسبق مطلوب",
 "Poolside, sea views": "بجانب المسبح مع إطلالة على البحر",
 "Live flute; beach/pool day pass option; Al Liwan is a FACT Dining Awards 2026 winner": "عزف حي على الناي؛ خيار تذكرة يومية للشاطئ والمسبح؛ الليوان فائز بجوائز FACT للمطاعم 2026",
 "Turkish spread: simit, mezze, charcoal kebabs, pastries": "مائدة تركية: سميط ومازة وكباب على الفحم ومعجنات",
 "Kids cooking class/entertainment; kids 6-12 QAR125, under-6 free": "حصة طبخ وترفيه للأطفال؛ الأطفال 6-12 سنة 125 ر.ق ومجاني لمن دون 6",
 "Kids Club access; FACT 2026 Best Family-Friendly Brunch (3rd year running)": "دخول نادي الأطفال؛ أفضل برانش عائلي من FACT 2026 (للعام الثالث على التوالي)",
 "Kids buffet + Mini Chef cooking; kids 6-11 half price, under-6 free": "بوفيه للأطفال وطبخ الشيف الصغير؛ الأطفال 6-11 بنصف السعر ومجاني لمن دون 6",
 "Market-style stations; family-friendly": "محطات على طراز السوق؛ مناسب للعائلات",
 "Carnival theme, live entertainment; 25% off via More Cravings": "طابع الكرنفال وترفيه حي؛ خصم 25٪ عبر مور كريفينغز",
 "Saturday samba: unlimited 7 meat cuts, gourmet stations, live entertainment": "سامبا السبت: 7 أنواع لحوم بلا حدود ومحطات فاخرة وترفيه حي",
 "Live entertainment; Time Out a-la-carte brunch list; B1G1 deals": "ترفيه حي؛ ضمن قائمة تايم آوت للبرانش من القائمة؛ عروض 1+1",
 "Spanish buffet: tapas, paellas, grills and desserts": "بوفيه إسباني: تاباس وباييا ومشاوي وحلويات",
 "Quiet, refined": "هادئ وراقٍ",
 "B1G1 on soft package; liquid brunch 5-8pm (QAR249)": "عرض 1+1 على باقة المشروبات الغازية؛ برانش المشروبات 5-8 م (249 ر.ق)",
 "DJ + live entertainment + pool access; kids 6-12 QAR150": "دي جي وترفيه حي ودخول المسبح؛ الأطفال 6-12 سنة 150 ر.ق",
 "Relaxed family vibe": "أجواء عائلية مريحة",
 "Michelin-recommended; FACT 2026 winner; live Peruvian entertainment": "موصى به من ميشلان؛ فائز FACT 2026؛ ترفيه بيروفي حي",
 "Elegant, calm": "أنيق وهادئ",
 "Premium cuts, live entertainment, skyline views": "قطع لحم فاخرة وترفيه حي وإطلالة على الأفق",
 "Live entertainment; kids 5-11 QAR160": "ترفيه حي؛ الأطفال 5-11 سنة 160 ر.ق",
 "Signature Latin bites served to the table; live acoustic singer; relaxed garden": "لقمات لاتينية مميزة تُقدَّم إلى الطاولة؛ مغنٍّ حي؛ حديقة هادئة",
 "Live band, skyline views; strong guest reviews": "فرقة حية وإطلالة على الأفق؛ تقييمات قوية من الضيوف",
 "DJ set; on The Entertainer": "دي جي؛ متوفر على إنترتينر",
 "Michelin-starred London parent; very Instagrammable; Time Out a-la-carte list": "الفرع الأم في لندن حائز على نجمة ميشلان؛ مثالي للصور؛ ضمن قائمة تايم آوت",
 "61st-floor views, live beats": "إطلالة من الطابق 61 وإيقاعات حية",
 "Live band + DJ, rooftop; FACT 2026 Favourite Social Brunch; B1G1 apps": "فرقة حية ودي جي على السطح؛ البرانش الاجتماعي المفضل من FACT 2026؛ عروض 1+1 في التطبيقات",
 "DJ, saxophonist, percussionist, performers + pool until 8pm": "دي جي وعازف ساكسفون وإيقاع وفنانون، والمسبح حتى 8 م",
 "Live band, Gulf views": "فرقة حية وإطلالة على الخليج",
 "Tropical party vibe; B1G1 platforms; After Brunch Flow 5-7pm": "أجواء حفلة استوائية؛ عروض 1+1 في المنصات؛ ما بعد البرانش 5-7 م",
 "Live entertainment (Garry Greg Duo, DJ)": "ترفيه حي (ثنائي غاري غريغ ودي جي)",
 "Refined Indian; high quality": "مطبخ هندي راقٍ وعالي الجودة",
 "Family entertainment; kids QAR175; 2-for-1 on More Cravings": "ترفيه عائلي؛ الأطفال 175 ر.ق؛ عرض 2 مقابل 1 على مور كريفينغز",
 "Live DJ; B1G1 on soft package": "دي جي حي؛ عرض 1+1 على باقة المشروبات الغازية",
 "Time Out Doha Awards 2025 Best a-la-carte brunch; kids 5-12 QAR185": "أفضل برانش من القائمة في جوائز تايم آوت الدوحة 2025؛ الأطفال 5-12 سنة 185 ر.ق",
 "Dazzling performances + live music; one of the liveliest": "عروض مبهرة وموسيقى حية؛ من أكثر البرانشات حيوية",
 "FACT 2026 award (Patio Edition); kids 6-12 QAR195": "جائزة FACT 2026 (نسخة الباحة)؛ الأطفال 6-12 سنة 195 ر.ق",
 "1920s theme, live entertainment; 2-for-1 on More Cravings": "طابع العشرينيات وترفيه حي؛ عرض 2 مقابل 1 على مور كريفينغز",
 "Live DJ and lively terrace; sushi and robata grill": "دي جي حي وتراس نابض بالحياة؛ سوشي وشواء روباتا",
 "Smart and stylish; separate Teppanyaki Brunch from QAR 280": "أنيق وعصري؛ برانش تيبانياكي منفصل من 280 ر.ق",
 "Relaxed, with a live singer": "أجواء هادئة مع مغنٍّ حي",
 "Art Deco room; jazz that builds into a party": "قاعة بطراز آرت ديكو؛ جاز يتحول إلى حفلة",
 "Authentic Thai with live stations and panoramic city views from the 24th floor; kids 6-12 half price": "تايلاندي أصيل مع محطات مباشرة وإطلالة بانورامية من الطابق 24؛ الأطفال 6-12 بنصف السعر",
 "Thai sharing plates served to the table; lounge music": "أطباق تايلاندية للمشاركة تُقدَّم إلى الطاولة؛ موسيقى هادئة",
 "Sushi, dim sum, live grills and wok stations; kids 5-11 QAR 190": "سوشي وديم سوم ومحطات شواء ووك مباشرة؛ الأطفال 5-11 سنة 190 ر.ق",
 "Riviera-style sharing brunch of LPM signatures; chic and lively": "برانش للمشاركة على طراز الريفييرا من أطباق لا بوتيت ميزون المميزة؛ أنيق وحيوي",
 "Rooftop pool access included, live DJ, kids' corner and supervised play; kids 6-12 QAR 99": "يشمل دخول مسبح السطح ودي جي حي وركن للأطفال بإشراف؛ الأطفال 6-12 سنة 99 ر.ق",
 "Long, relaxed Italian sharing lunch for families and friends": "غداء إيطالي طويل وهادئ للمشاركة مع العائلة والأصدقاء",
 "Sharing starter then a roast platter with all the trimmings": "مقبلات للمشاركة ثم طبق روست مع جميع الإضافات",
 "'The Real Brunch' on Marsa Arabia island; kids 6-12 QAR 145, under 6 free": "«البرانش الحقيقي» في جزيرة مرسى عربية؛ الأطفال 6-12 سنة 145 ر.ق ومجاني لمن دون 6",
 "Family-style Italian Saturday lunch": "غداء السبت الإيطالي العائلي",
 "Pool access and live BBQ; kids QAR 50": "دخول المسبح وشواء مباشر؛ الأطفال 50 ر.ق",
 "Italian classics with live entertainment": "أطباق إيطالية كلاسيكية مع ترفيه حي",
 "Relaxed seafood sharing menu; kids QAR 85, under 6 free; minimum 2 people": "قائمة مأكولات بحرية هادئة للمشاركة؛ الأطفال 85 ر.ق ومجاني لمن دون 6؛ الحد الأدنى شخصان",
 "Brunch by the marina with complimentary pool and beach access": "برانش بجانب المارينا مع دخول مجاني إلى المسبح والشاطئ",
 "Dim sum with a live DJ set": "ديم سوم مع دي جي حي",
 "Classic New York brunch favourites and fresh bakes": "أطباق برانش نيويورك الكلاسيكية ومخبوزات طازجة",
 "Low-key all-morning set brunch; no buffet": "برانش ثابت هادئ طوال الصباح؛ بدون بوفيه",
 "Late breakfast-style brunch; kids 6-11 QAR 60": "برانش على طريقة الفطور المتأخر؛ الأطفال 6-11 سنة 60 ر.ق",
 "Locally sourced mezze, slow-cooked tagines and grills with Torba Farm": "مازة من مصادر محلية وطواجن مطهوة ببطء ومشاوي مع مزرعة تربة",
 "Italian Saturday buffet": "بوفيه السبت الإيطالي",
 "Poolside mezze and charcoal kebabs": "مازة وكباب على الفحم بجانب المسبح",
}

NOTICE = {
 "Couples package: QAR 299 for two.": "باقة الأزواج: 299 ر.ق لشخصين.",
 "Select Saturdays only (7 and 21 Nov 2026). Check the next date before you go.": "أيام سبت محددة فقط (7 و21 نوفمبر 2026). تحقق من الموعد التالي قبل الذهاب.",
 "Minimum 2 guests.": "الحد الأدنى ضيفان.",
 "Signature bites served to the table, not a full buffet.": "لقمات مميزة تُقدَّم إلى الطاولة، وليس بوفيه كاملًا.",
 "First Friday of the month only. Check the next date before you go.": "أول جمعة من كل شهر فقط. تحقق من الموعد التالي قبل الذهاب.",
 "Sharing starters plus one main course.": "مقبلات للمشاركة وطبق رئيسي واحد.",
 "Sharing menu for a minimum of 2 people.": "قائمة للمشاركة لشخصين على الأقل.",
 "Priced per couple: QAR 300 for two, plus QAR 170 per extra guest.": "السعر لكل زوج: 300 ر.ق لشخصين، و170 ر.ق لكل ضيف إضافي.",
 "Set menu for two: QAR 155 including two drinks (about QAR 78 each).": "قائمة ثابتة لشخصين: 155 ر.ق مع مشروبين (نحو 78 ر.ق للشخص).",
}

AREA = {
 "Al Sadd": "السد", "Msheireb": "مشيرب", "The Pearl": "اللؤلؤة", "West Bay": "الخليج الغربي", "Al Gassar": "القصار",
 "Fereej Bin Mahmoud": "فريج بن محمود", "Lusail Marina": "مارينا لوسيل", "Ras Abu Aboud": "رأس أبو عبود", "West Bay Lagoon": "لاغونا الخليج الغربي",
 "Al Messila (Al Rayyan)": "المسيلة (الريان)", "Doha (area not verified)": "الدوحة (المنطقة غير مؤكدة)", "Corniche": "الكورنيش",
 "West Bay (Al Dafna)": "الخليج الغربي (الدفنة)", "Katara": "كتارا", "West Bay (Corniche)": "الخليج الغربي (الكورنيش)",
 "The Pearl (Porto Arabia)": "اللؤلؤة (بورتو أرابيا)", "Lusail": "لوسيل", "Al Maha Island, Lusail": "جزيرة المها، لوسيل",
 "Mushaireb (24th floor)": "مشيرب (الطابق 24)", "C Ring Road": "الدائري الثالث", "Doha (near the airport)": "الدوحة (قرب المطار)",
 "West Bay (City Center)": "الخليج الغربي (سيتي سنتر)",
}
GROUP = {"Msheireb & Old Doha": "مشيرب والدوحة القديمة", "The Pearl & Katara": "اللؤلؤة وكتارا", "West Bay": "الخليج الغربي",
         "Beach & Desert Resorts": "منتجعات الشاطئ والصحراء", "Lusail": "لوسيل", "Doha": "الدوحة"}
LINK = {"More info": "مزيد من المعلومات", "Venue page": "صفحة المكان", "Book online": "احجز عبر الإنترنت", "View menu": "عرض القائمة"}
DRINKS_LABEL = {"No alcohol package listed": "لا توجد باقة كحول مدرجة", "No alcohol (soft drinks only)": "بدون كحول (مشروبات غازية فقط)"}
UPGRADE = {"+150 pool & beach access": "+150 دخول المسبح والشاطئ", "375 incl. pool & beach access": "375 شامل دخول المسبح والشاطئ"}
HOURS_SPECIAL = {
 "Select Saturdays (7 & 21 Nov 2026), 1pm-4pm": "أيام سبت محددة (7 و21 نوفمبر 2026)، 1 م - 4 م",
 "First Friday of the month only": "أول جمعة من الشهر فقط",
 "Fridays (hours not published, call to check)": "أيام الجمعة (المواعيد غير منشورة، اتصل للتأكد)",
}

# Phrase rules for prices, package names and hours (longest first)
TERMS = [
 ("Champagne package", "باقة الشمبانيا"), ("A Champagne Life", "حياة الشمبانيا"), ("A Mocktail Life", "حياة الموكتيل"),
 ("add-on house beverages", "إضافة مشروبات البيت"), ("house pours (2 hours)", "مشروبات البيت (ساعتان)"),
 ("selected house beverages", "مشروبات البيت المختارة"), ("house beverage package", "باقة مشروبات البيت"), ("house beverages", "مشروبات البيت"),
 ("selected beverage package", "باقة المشروبات المختارة"),
 ("unlimited beverage package", "باقة مشروبات بلا حدود"), ("special beverage package", "باقة مشروبات خاصة"),
 ("enhanced beverage package", "باقة المشروبات المحسّنة"), ("2 extra hours, enhanced beverages", "ساعتان إضافيتان، مشروبات محسّنة"),
 ("for two extra hours of enhanced beverages", "لساعتين إضافيتين من المشروبات المحسّنة"), ("2 hours enhanced beverages", "ساعتان من المشروبات المحسّنة"),
 ("enhanced package", "الباقة المحسّنة"), ("premium package", "الباقة الممتازة"), ("beverage packages", "باقات المشروبات"),
 ("drinks packages", "باقات المشروبات"), ("Drinks package", "باقة المشروبات"), ("alcoholic package", "باقة الكحول"),
 ("premium alcoholic", "كحول ممتاز"), ("enhanced drinks", "مشروبات محسّنة"), ("enhanced sips", "رشفات محسّنة"),
 ("house pours, 2 hours", "مشروبات البيت، ساعتان"), ("house sips", "رشفات البيت"),
 ("grapes & brew", "عنب وبيرة"), ("caviar & martini bar", "كافيار وبار مارتيني"), ("adds caviar & martini bar", "يضيف الكافيار وبار المارتيني"),
 ("higher tier, adds Italian sparkling", "فئة أعلى، تضيف الفوّار الإيطالي"),
 ("incl. pool & beach", "شامل المسبح والشاطئ"), ("incl. pool access", "شامل دخول المسبح"), ("incl. pool", "شامل المسبح"),
 ("incl. Chinese tea", "شامل الشاي الصيني"), ("incl. water", "شامل الماء"), ("still & sparkling water", "ماء عادي وفوّار"),
 ("signature bites", "لقمات مميزة"), ("min. 2 people", "شخصان على الأقل"), ("set menu", "قائمة ثابتة"), ("per couple", "لكل زوج"),
 ("for two", "لشخصين"), ("selected enhanced", "محسّنة مختارة"), ("selected", "مختارة"), ("enhanced", "محسّنة"), ("premium", "ممتازة"),
 ("specialty", "مميزة"), ("sparkling", "فوّار"), ("bubbly", "فوّار"), ("bubbles", "فقاعات"), ("regular", "عادية"),
 ("house", "البيت"), ("Enhanced", "محسّنة"), ("Bubbly", "فوّار"), ("Astor package", "باقة أستور"), ("Astor", "أستور"),
 ("Champagne", "شمبانيا"), ("champagne", "شمبانيا"), ("Kyasha", "كياشا"), ("Chill", "تشيل"), ("from", "من"), ("From", "من"), ("with", "مع"), ("adds", "يضيف"),
 ("and", "و"), ("QAR", "ر.ق"),
]
def phrase(s):
    if not s:
        return s
    for a, b in TERMS:
        s = re.sub(r"(?<![A-Za-z])" + re.escape(a) + r"(?![A-Za-z])", b, s)
    return s

DAY = {"Fri & Sat": "الجمعة والسبت", "Fri": "الجمعة", "Sat": "السبت"}
def hours(s):
    if not s:
        return s
    if s in HOURS_SPECIAL:
        return HOURS_SPECIAL[s]
    out = s
    for a, b in DAY.items():
        out = re.sub(r"^" + re.escape(a) + r"\b", b, out)
    out = re.sub(r"(\d{1,2}(?::\d{2})?)(am|pm)", lambda m: m.group(1) + (" ص" if m.group(2) == "am" else " م"), out)
    out = out.replace("-", " - ").replace("  ", " ")
    out = out.replace("(pool 12 - 7 م)", "(المسبح 12 - 7 م)").replace("(pool to 8 م)", "(المسبح حتى 8 م)").replace("(last call 3:45 م)", "(آخر طلب 3:45 م)")
    return out

# Deal notes and source dates shown under the deal and drinks details
META = {
 "Brunch-package voucher; soft package per More Cravings": "قسيمة باقة برانش؛ باقة المشروبات الغازية حسب مور كريفينغز",
 "Listed as B1G1 on promotional platforms": "مدرج كعرض 1+1 على منصات العروض",
 "Marhaba says 'Available on B1G1' - check which app": "يذكر مرحبا أنه «متاح على B1G1»، تحقق من التطبيق",
 "Marhaba says 2-for-1 on More Cravings; FACT says 25% off - check the app": "يذكر مرحبا عرض 2 مقابل 1 على مور كريفينغز، وتذكر FACT خصم 25%، تحقق من التطبيق",
 "Soft-drinks package only": "باقة المشروبات الغازية فقط",
 "Soft-drinks package": "باقة المشروبات الغازية",
 "Dusit venue page, checked 16 Nov 2026": "صفحة دوسيت، تم التحقق 16 نوفمبر 2026",
 "FACT Qatar, Nov 2026": "FACT قطر، نوفمبر 2026",
 "Marhaba Saturday guide, updated 8 Nov 2026": "دليل مرحبا للسبت، محدّث 8 نوفمبر 2026",
 "Marhaba Saturday guide, updated 8 Nov 2026; More Cravings Bay View venue page": "دليل مرحبا للسبت، محدّث 8 نوفمبر 2026؛ صفحة باي فيو على مور كريفينغز",
 "Marhaba, updated 8 Nov 2026": "مرحبا، محدّث 8 نوفمبر 2026",
 "Marhaba, updated 8 Nov 2026; FACT Nov 2026": "مرحبا، محدّث 8 نوفمبر 2026؛ FACT نوفمبر 2026",
 "More Cravings venue page, checked 16 Nov 2026 (voucher expires 31 Dec 2026)": "صفحة المطعم على مور كريفينغز، تم التحقق 16 نوفمبر 2026 (تنتهي القسيمة 31 ديسمبر 2026)",
 "More Cravings voucher (expires 31 Dec 2026); Marhaba Saturday guide, updated 8 Nov 2026": "قسيمة مور كريفينغز (تنتهي 31 ديسمبر 2026)؛ دليل مرحبا للسبت، محدّث 8 نوفمبر 2026",
 "Qatar Living deal, valid to 22 Jan 2027": "عرض قطر ليفينغ، صالح حتى 22 يناير 2027",
 "SupperClub listing updated 25 Oct 2026; New In Doha (Entertainer)": "قائمة سابر كلوب محدّثة 25 أكتوبر 2026؛ نيو إن دوحة (إنترتينر)",
}
MONTHS = {"Jan": "يناير", "Feb": "فبراير", "Mar": "مارس", "Apr": "أبريل", "May": "مايو", "Jun": "يونيو", "Jul": "يوليو",
          "Aug": "أغسطس", "Sep": "سبتمبر", "Oct": "أكتوبر", "Nov": "نوفمبر", "Dec": "ديسمبر"}
def meta(s):
    if not s:
        return s
    if s in META:
        return META[s]
    if re.fullmatch(r"(\d{1,2} )?[A-Z][a-z]{2} \d{4}|\d{4}", s):
        return re.sub(r"[A-Z][a-z]{2}", lambda m: MONTHS[m.group(0)], s)
    raise KeyError(s)
