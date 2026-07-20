const TRANSLATIONS: Record<string, Record<string, string>> = {
  ar: {
    // Navigation Links
    "COLLECTIONS": "المجموعات",
    "WATCHES": "الساعات",
    "TESTIMONIALS": "الشهادات",
    "BLOG": "المجلة",
    
    // Header & Buttons
    "WHATSAPP SUPPORT": "دعم واتساب",
    "WHATSAPP": "واتساب",
    "VIEW SPECS": "عرض المواصفات",
    "ORDER SECURELY VIA WHATSAPP": "اطلب بأمان عبر الواتساب",
    "BACK TO ALL COLLECTIONS": "العودة إلى جميع المجموعات",
    "EXPLORE MORE FROM": "استكشف المزيد من",
    "Exclusive Price": "السعر الحصري",
    "VAT INCLUDED": "شامل ضريبة القيمة المضافة",
    "HOVER OR CLICK TO ZOOM": "مرر الماوس أو انقر للتكبير",
    "CLICK IMAGE TO ZOOM OUT": "انقر على الصورة للتصغير",
    "RETRIEVING SPECIFICATIONS...": "جاري جلب المواصفات...",
    "2-YEAR SERVICE WARRANTY": "ضمان خدمة لمدة سنتين",
    "Protection standard": "معيار الحماية",
    "Same Day Delivery": "توصيل في نفس اليوم",
    "Same-Day Free Delivery": "توصيل مجاني بنفس اليوم",
    "SAME-DAY FREE DELIVERY": "توصيل مجاني بنفس اليوم",
    "LOCAL COURIER USP": "خدمة التوصيل المحلي المميزة",
    "FAST GLOBAL SHIPPING": "شحن عالمي سريع",
    "DHL & FEDEX EXPRESS": "دي إتش إل وفيدكس إكسبريس",
    "DUTY-FREE GUARANTEE": "ضمان الإعفاء الجمركي",
    "SECURE INSURED PARTNERS": "شركاء شحن مؤمنين وموثوقين",
    
    // Specifications Fields (table keys)
    "Brand": "الماركة",
    "Model": "الموديل",
    "Reference": "الرقم المرجعي",
    "Material": "المادة",
    "Size": "المقاس",
    "Movement": "الحركة",
    "Caliber": "العيار",
    "Bezel Configuration": "تكوين الإطار",
    "Crystal Glass": "زجاج الكريستال",
    "Water Testing": "فحص مقاومة الماء",
    "Service Warranty": "ضمان الخدمة",

    // Home / Signature Collection Filter
    "ALL BRANDS": "جميع الماركات",
    "ALL CATEGORIES": "جميع الفئات",
    "MENS": "رجالي",
    "WOMENS": "نسائي",
    "ALL": "الكل",
    "Search by model, brand, category, or style...": "البحث عن طريق الموديل، الماركة، الفئة، أو الطراز...",
    "Search Timepieces": "البحث في الساعات",
    "Filter by Brand": "تصفية حسب الماركة",
    "Filter by Model": "تصفية حسب الموديل",
    "Close filters": "إغلاق التصفية",
    "Master Copy": "ماستر كوبي",
    "More Brands": "المزيد من الماركات",
    "Collection": "المجموعة",
    "TECHNICAL SPECIFICATIONS": "المواصفات الفنية",
    "DOSSIER DESCRIPTION": "وصف الملف",
    "Specifications": "المواصفات",
    "Description": "الوصف",
    "No reviews yet": "لا توجد مراجعات بعد",
    "Write a review": "اكتب مراجعة",
    "No reviews have been written yet. Be the first to share your thoughts!": "لم يتم كتابة أي مراجعات بعد. كن أول من يشارك أفكاره!",
    "Show Original": "عرض الأصلي",
    "IN STOCK": "متوفر",
    "SIGNATURE TIMEPIECE": "ساعة مميزة",
    "LOAD MORE WATCHES": "تحميل المزيد من الساعات",
    "NO WATCHES MATCHING YOUR SEARCH. PLEASE BROWSE ALL BRAND PILLS.": "لا توجد ساعات تطابق بحثك. يرجى تصفح جميع الماركات.",
    "Select a brand to view available model variants.": "اختر ماركة لعرض موديلات الساعات المتاحة.",
    "Suggestions by Brand": "مقترحات حسب الماركة",
    "Suggestions by Range": "مقترحات حسب الفئة والموديل",
    "SHOWING": "عرض",
    "OF": "من",
    "HIGH-QUALITY MODELS AVAILABLE": "من الموديلات عالية الجودة المتاحة",

    // Footer Translations
    "CONTACT US": "اتصل بنا",
    "CUSTOMER SERVICE": "خدمة العملاء",
    "CHAT VIA WHATSAPP": "الدردشة عبر الواتساب",
    "CASH ON DELIVERY (GCC)": "الدفع عند الاستلام (الخليج)",
    "USDT / CRYPTO": "يو إس دي تي / عملات رقمية",
    "BANK TRANSFER": "تحويل بنكي",
    "© 2026 T24 Watches Dubai. All rights reserved. Premium timepieces.": "© 2026 تي 24 للساعات دبي. جميع الحقوق محفوظة. ساعات فاخرة.",
    "© 2026 T24 Watches Dubai. All rights reserved. 1:1 Swiss Clone replica timepieces.": "© 2026 تي 24 للساعات دبي. جميع الحقوق محفوظة. ساعات ماستر كوبي طبق الأصل ١:١.",
    "Rolex Watches": "ساعات رولكس",
    "Patek Philippe Watches": "ساعات باتيك فيليب",
    "Audemars Piguet Watches": "ساعات أوديمار بيجيه",
    "Richard Mille Watches": "ساعات ريتشارد ميل",
    "Vacheron Constantin": "فاشيرون كونستانتين",
    "Rolex 1:1 Clones": "رولكس كلون ١:١",
    "Patek Philippe Clones": "باتيك فيليب كلون ١:١",
    "Audemars Piguet Clones": "أوديمار بيجيه كلون ١:١",
    "Richard Mille Clones": "ريتشارد ميل كلون ١:١",
    "OUR SPECIFICATIONS": "مواصفاتنا",
    "Clone Caliber Movement": "حركة كاليبر كلون",
    "904L Anti-Corrosive Steel": "فولاذ 904L المقاوم للصدأ",
    "Bespoke Bezel Finishes": "تشطيبات إطار مخصصة",
    "Ultra-Clear Sapphire Glass": "زجاج سافير فائق الوضوح",
    "T24 REPLICA ASSURANCE": "ضمان تي ٢٤ للجودة",
    "1:1 Weight Guarantee": "ضمان الوزن المطابق ١:١",
    "AAA+ Precision Sweeping": "حركة انسيابية دقيقة AAA+",
    "Indistinguishable Engravings": "نقوش مطابقة تماماً للأصل",
    "Dual Waterproof Seals": "أختام ثنائية لمقاومة الماء",
    "WhatsApp Order Desk": "مكتب طلبات واتساب",
    "QC Photo Review": "مراجعة صور الجودة (QC)",
    "GCC Secure Delivery": "توصيل آمن لدول الخليج",
    "Secure Packaging": "تغليف آمن",
    "Hi T24 Watches! I'm visiting your website and would like to inquire about your premium watch collection.": "مرحبًا تي 24 للساعات! أنا أزور موقعكم وأود الاستفسار عن مجموعة الساعات الفاخرة المتاحة لديكم.",
    "Hi T24 Watches! I'm visiting your website and would like to inquire about your premium 1:1 Swiss Clone watch collection.": "مرحبًا تي 24 للساعات! أنا أزور موقعكم وأود الاستفسار عن مجموعة ساعات الماستر كوبي الفاخرة.",

    // Testimonials Translations
    "CUSTOMER REVIEWS": "آراء العملاء",
    "REPUTATION IS": "السمعة هي",
    "EVERYTHING": "كل شيء",
    "Read verified testimonials from real watch collectors and enthusiasts who trusted our custom watch configurations.": "اقرأ شهادات موثقة من جامعي الساعات وعشاقها الحقيقيين الذين وثقوا في تكوينات ساعاتنا المخصصة.",

    // Hero Stats Translations
    "FREE": "مجانًا",
    "Same-day delivery": "توصيل في نفس اليوم",
    "2 YR": "سنتين",
    "Service warranty": "ضمان الخدمة",
    "COD": "الدفع عند الاستلام",
    "Multiple payments": "طرق دفع متعددة"

    // Shared storefront, journal and administration interface
    ,"The Master Collection": "المجموعة الرئيسية"
    ,"CATALOGUE": "الكتالوج"
    ,"Sort By": "الترتيب حسب"
    ,"Default": "الافتراضي"
    ,"Price: Low to High": "السعر: من الأقل إلى الأعلى"
    ,"Price: High to Low": "السعر: من الأعلى إلى الأقل"
    ,"MASTER TIMEPIECES": "ساعة فاخرة"
    ,"SWISS QC STANDARDS GUARANTEED": "معايير الجودة السويسرية مضمونة"
    ,"Automatic Swiss Clone": "حركة أوتوماتيكية سويسرية"
    ,"Reset Filters": "إعادة ضبط عوامل التصفية"
    ,"The Watch": "عالم الساعات"
    ,"Journal": "المجلة"
    ,"T24 Editorial": "تحرير تي 24"
    ,"detailed guides": "أدلة تفصيلية"
    ,"Independent education": "محتوى تثقيفي مستقل"
    ,"Updated weekly": "تحديث أسبوعي"
    ,"All": "الكل"
    ,"Featured": "مميز"
    ,"min read": "دقائق للقراءة"
    ,"Read article": "اقرأ المقال"
    ,"Read more →": "اقرأ المزيد ←"
    ,"No journal articles are available.": "لا توجد مقالات متاحة حاليًا."
    ,"Article not found": "المقال غير موجود"
    ,"Return to the journal": "العودة إلى المجلة"
    ,"Back to journal": "العودة إلى المجلة"
    ,"In this guide": "في هذا الدليل"
    ,"Continue shopping": "تابع التسوق"
    ,"Compare the references in our catalogue.": "قارن بين الموديلات في كتالوجنا."
    ,"Explore collections →": "استكشف المجموعات ←"
    ,"Continue exploring": "واصل الاستكشاف"
    ,"Browse every available timepiece.": "تصفّح جميع الساعات المتاحة."
    ,"View all watches": "عرض جميع الساعات"
    ,"Worn by": "يرتديها"
    ,"Icons": "المشاهير"
    ,"Exact reference match": "تطابق دقيق مع الموديل"
    ,"Seen on": "شوهدت مع"
    ,"Editorial source": "المصدر التحريري"
    ,"Available reference": "الموديل المتاح"
    ,"View watch": "عرض الساعة"
    ,"Shop the edit": "تسوّق الاختيارات"
    ,"T24 delivery promise": "وعد تي 24 للتوصيل"
    ,"From Dubai.": "من دبي."
    ,"To your wrist.": "إلى معصمك."
    ,"QC checked before dispatch": "فحص الجودة قبل الشحن"
    ,"Secure presentation packaging": "تغليف فاخر وآمن"
    ,"Dubai priority": "أولوية دبي"
    ,"Free UAE delivery": "توصيل مجاني داخل الإمارات"
    ,"United Arab Emirates": "الإمارات العربية المتحدة"
    ,"GCC destinations": "وجهات الخليج"
    ,"Regional shipping": "شحن إقليمي"
    ,"International desk": "خدمة دولية"
    ,"Delivery to the USA": "توصيل إلى الولايات المتحدة"
    ,"Confirm your destination": "أكّد وجهة التوصيل"
    ,"Ask our team for your delivery window.": "اسأل فريقنا عن موعد التوصيل المتاح."
    ,"Delivery support": "دعم التوصيل"
    ,"The moment on the wrist. The exact reference beside it. Four personalities, matched to four editions available in our store.": "لحظة مميزة على المعصم، والموديل المطابق بجانبها. أربع شخصيات وأربعة إصدارات متاحة في متجرنا."
    ,"In stock": "متوفر"
    ,"The matching watch": "الساعة المطابقة"
    ,"Available edition": "الإصدار المتاح"
    ,"Shop this watch": "تسوّق هذه الساعة"
    ,"Order confirmation, QC review, and complimentary delivery across Dubai on eligible orders.": "تأكيد الطلب ومراجعة الجودة وتوصيل مجاني داخل دبي للطلبات المؤهلة."
    ,"T24 Icon Edit · 2026": "تحرير أيقونات تي 24 · 2026"
    ,"Editorial source · ": "المصدر التحريري · "
    ,"T24 catalogue edition": "إصدار كتالوج تي 24"
    ,"Editorial watch-spotting only. Celebrity images show original references; no affiliation or endorsement of T24 Watches is implied.": "لرصد الساعات التحريرية فقط. تُظهر صور المشاهير الموديلات الأصلية؛ ولا يُقصد بها أي انتساب أو تأييد لـ T24 Watches."
    ,"Secure, carefully packed delivery throughout the UAE with no additional delivery charge.": "توصيل آمن ومغلف بعناية إلى جميع أنحاء الإمارات دون رسوم إضافية."
    ,"Tracked shipping to Saudi Arabia, Qatar, Kuwait, Bahrain, and Oman.": "شحن قابل للتتبع إلى السعودية وقطر والكويت والبحرين وعُمان."
    ,"Door-to-door international dispatch supported by our Dubai team.": "شحن دولي من الباب إلى الباب بدعم من فريقنا في دبي."
    ,"Complimentary same-day delivery in Dubai, free delivery across the UAE, and secure worldwide shipping to the USA and GCC countries.": "توصيل مجاني في اليوم نفسه داخل دبي، وتوصيل مجاني في الإمارات، وشحن عالمي آمن إلى الولايات المتحدة ودول الخليج."
    ,"MASTER PIECE CATALOGUE": "كتالوج الساعات الراقية"
    ,"CURATED FOR": "مختارة من أجل"
    ,"DISTINCTION": "التميّز"
    ,"TIMEPIECES": "ساعات"
    ,"Engineered for presence. Featuring high-durability 904L Oystersteel, automatic mechanical sweep calibers, and balanced chronographs.": "مصممة لحضور لافت، بفولاذ أويسترستيل 904L المتين، وحركات ميكانيكية أوتوماتيكية وانسيابية، وكرونوغراف متوازن."
    ,"EXPLORE MENS DIRECTORY →": "استكشف مجموعة الرجال ←"
    ,"Sculpted elegance. Showcasing refined sizes, diamond-encrusted dials, mother of pearl finishes, and high-precision sweep movements.": "أناقة منحوتة بأحجام راقية وموانئ مرصعة بالألماس وتشطيبات عرق اللؤلؤ وحركات انسيابية عالية الدقة."
    ,"EXPLORE WOMENS DIRECTORY →": "استكشف مجموعة النساء ←"
    ,"BEST SELLER": "الأكثر مبيعًا"
    ,"NEW ARRIVAL": "وصل حديثًا"
    ,"EXQUISITE": "استثنائي"
    ,"CRAFTSMANSHIP": "الحرفية"
    ,"Spotlight": "تحت الضوء"
    ,"Explore our latest curated timepieces, featuring ultra-precise movements, custom engineering, and original weight specifications.": "استكشف أحدث ساعاتنا المختارة بحركات فائقة الدقة وهندسة مخصصة ومواصفات وزن مطابقة."
    ,"Hover to focus / click arrows to slide": "مرّر للتركيز / انقر الأسهم للتنقل"
    ,"SWISS MOVEMENT": "حركة سويسرية"
    ,"904L OYSTERSTEEL": "فولاذ أويسترستيل 904L"
    ,"SAPPHIRE CRYSTAL": "زجاج سافير"
    ,"THE SIGNATURE": "التشكيلة المميزة"
    ,"DUBAI WATCHES": "ساعات دبي"
    ,"Superclone Dubai": "سوبر كلون دبي"
    ,"Luxury Watch Journal Dubai | T24 Watches": "مجلة الساعات الفاخرة في دبي | تي 24 للساعات"
    ,"Luxury Replica Watch Collections Dubai | T24 Watches": "مجموعات الساعات الفاخرة في دبي | تي 24 للساعات"
    ,"In-depth reference guides, movement explainers, style advice, and practical watch-care knowledge for collectors in Dubai.": "أدلة متعمقة للموديلات، وشرح للحركات، ونصائح للأناقة والعناية العملية بالساعات لهواة الجمع في دبي."
    ,"Explore our comprehensive index of 1:1 luxury replica watches. Configured with genuine weights, exact dimensions, and premium materials to ensure zero distinction from local boutiques.": "استكشف دليلنا الشامل للساعات الفاخرة بنسبة 1:1، بأوزان مطابقة وأبعاد دقيقة وخامات راقية تمنحك حضورًا استثنائيًا."
    ,"Click to expand": "انقر للتكبير"
    ,"Hover to zoom · Click to expand": "مرّر للتكبير · انقر للعرض الكامل"
    ,"Hover to zoom": "مرّر للتكبير"
    ,"Previous Brand Suggestions": "اقتراحات الماركات السابقة"
    ,"Next Brand Suggestions": "اقتراحات الماركات التالية"
    ,"Previous Range Suggestions": "اقتراحات الفئات السابقة"
    ,"Next Range Suggestions": "اقتراحات الفئات التالية"
    ,"Change Language": "تغيير اللغة"
    ,"Toggle menu": "فتح أو إغلاق القائمة"
    ,"Previous Products": "المنتجات السابقة"
    ,"Next Products": "المنتجات التالية"

    // Administrative interface
    ,"SECURE ACCESS GATEWAY": "بوابة دخول آمنة"
    ,"Administrative Control Panel": "لوحة التحكم الإدارية"
    ,"Username ID": "اسم المستخدم"
    ,"Security Keyphrase": "كلمة المرور"
    ,"Enter administrator ID...": "أدخل اسم المستخدم..."
    ,"VERIFYING...": "جارٍ التحقق..."
    ,"AUTHORIZE SYSTEM LOGIN": "تسجيل الدخول"
    ,"Catalogue Inventory": "مخزون الكتالوج"
    ,"Watch Preview": "معاينة الساعة"
    ,"Model Name": "اسم الموديل"
    ,"Category": "الفئة"
    ,"Edition": "الإصدار"
    ,"Price USD": "السعر بالدولار"
    ,"Price AED": "السعر بالدرهم"
    ,"Stock": "المخزون"
    ,"Storefront": "واجهة المتجر"
    ,"Actions": "الإجراءات"
    ,"In Stock": "متوفر"
    ,"Sold Out": "نفد المخزون"
    ,"Search catalogue by name or brand...": "ابحث في الكتالوج بالاسم أو الماركة..."
    ,"No watches registered matching search query.": "لا توجد ساعات تطابق عبارة البحث."
    ,"Products": "المنتجات"
    ,"Homepage": "الصفحة الرئيسية"
    ,"Logout": "تسجيل الخروج"
    ,"Add Watch": "إضافة ساعة"
    ,"Save Changes": "حفظ التغييرات"
    ,"Saving...": "جارٍ الحفظ..."
    ,"Hero": "الواجهة الرئيسية"
    ,"Arrivals": "وصل حديثًا"
    ,"Heritage": "التراث"
    ,"Atelier": "المشغل"
    ,"Testimonials": "آراء العملاء"
    ,"Footer": "التذييل"
    ,"Client Name": "اسم العميل"
    ,"Location": "الموقع"
    ,"Client Role / Profession": "وظيفة العميل"
    ,"Watch Model Purchased": "موديل الساعة المشتراة"
    ,"Rating Score": "التقييم"
    ,"Client Avatar Image URL": "رابط صورة العميل"
    ,"Client Review Quote Description": "نص مراجعة العميل"
    ,"Representative Name": "اسم ممثل المبيعات"
    ,"WhatsApp Number (e.g. 971501234567)": "رقم واتساب (مثال: 971501234567)"
    ,"Active (Included in rotation)": "نشط (مشمول في التوزيع)"
    ,"Featured (Highlighted in UI)": "مميز (يظهر بشكل بارز)"
    ,"Availability status": "حالة التوفر"
    ,"MARK AS IN STOCK FOR SALE": "تحديد كمتوفر للبيع"
    ,"Storefront visibility": "الظهور في المتجر"
    ,"SHOW THIS WATCH ON THE STOREFRONT": "إظهار هذه الساعة في المتجر"
    ,"Catalogue Description": "وصف الكتالوج"
    ,"Confirm Watch Deletion": "تأكيد حذف الساعة"
    ,"Cancel": "إلغاء"
    ,"Delete": "حذف"
  }
};

export function translate(text: string, lang: string): string {
  if (!text) return '';
  if (lang === 'ar' && TRANSLATIONS.ar[text]) {
    return TRANSLATIONS.ar[text];
  }
  return text;
}

export function translateUiText(text: string, lang = 'ar'): string {
  if (!text || lang !== 'ar') return text

  const leading = text.match(/^\s*/)?.[0] || ''
  const trailing = text.match(/\s*$/)?.[0] || ''
  const value = text.trim()
  if (!value) return text

  const exact = TRANSLATIONS.ar[value]
  if (exact) return `${leading}${exact}${trailing}`

  const compoundReplacements: Array<[RegExp, string]> = [
    [/\bFeatured\b/g, 'مميز'],
    [/\bmin read\b/g, 'دقائق للقراءة'],
    [/\bmin\b/g, 'دقائق'],
    [/\bdetailed guides\b/g, 'أدلة تفصيلية'],
  ]

  let translated = value
  for (const [pattern, replacement] of compoundReplacements) {
    translated = translated.replace(pattern, replacement)
  }
  return translated === value ? text : `${leading}${translated}${trailing}`
}
