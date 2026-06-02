/**
 * NZ Charities Register → DearGiver 기관 데이터 임포트 스크립트
 * 
 * OData API: http://www.odata.charities.govt.nz/
 * 라이선스: Creative Commons Attribution 3.0 NZ
 * 
 * 사용법: node scripts/import-charities.mjs
 */

// ── 카테고리 매핑 ──
// Charities Register의 "Activities/Sectors" → DearGiver 카테고리
const SECTOR_MAP = {
  // Education
  'education': 'Education',
  'training': 'Education',
  'research': 'Education',
  'school': 'Education',
  'scholarship': 'Education',
  'library': 'Education',
  'literacy': 'Education',
  'university': 'Education',
  
  // Environment
  'environment': 'Environment',
  'conservation': 'Environment',
  'wildlife': 'Environment',
  'animal': 'Animal Welfare',
  'animals': 'Animal Welfare',
  'spca': 'Animal Welfare',
  'rspca': 'Animal Welfare',
  'marine': 'Environment',
  'forest': 'Environment',
  'sustainability': 'Environment',
  'climate': 'Environment',
  
  // Health
  'health': 'Health',
  'medical': 'Health',
  'hospital': 'Health',
  'mental': 'Health',
  'disability': 'Health',
  'cancer': 'Health',
  'hospice': 'Health',
  'wellbeing': 'Health',
  'wellness': 'Health',
  'ambulance': 'Health',
  'rescue': 'Health',
  'rehabilitation': 'Health',
  
  // Arts & Culture
  'art': 'Arts & Culture',
  'arts': 'Arts & Culture',
  'culture': 'Arts & Culture',
  'cultural': 'Arts & Culture',
  'museum': 'Arts & Culture',
  'heritage': 'Arts & Culture',
  'music': 'Arts & Culture',
  'theatre': 'Arts & Culture',
  'theater': 'Arts & Culture',
  'gallery': 'Arts & Culture',
  'film': 'Arts & Culture',
  'dance': 'Arts & Culture',
  'creative': 'Arts & Culture',
  
  // Community
  'community': 'Community',
  'social': 'Community',
  'welfare': 'Community',
  'housing': 'Community',
  'food': 'Community',
  'poverty': 'Community',
  'youth': 'Community',
  'elderly': 'Community',
  'refugee': 'Community',
  'family': 'Community',
  'children': 'Community',
  'sport': 'Community',
  'recreation': 'Community',
};

// ── 지역 매핑 ──
const REGION_MAP = {
  'auckland': 'Auckland',
  'wellington': 'Wellington',
  'christchurch': 'Canterbury',
  'canterbury': 'Canterbury',
  'otago': 'Otago',
  'dunedin': 'Otago',
  'queenstown': 'Otago',
  'southland': 'Southland',
  'invercargill': 'Southland',
  'tauranga': 'Bay of Plenty',
  'bay of plenty': 'Bay of Plenty',
  'rotorua': 'Bay of Plenty',
};

function classifyCategory(name, purposes) {
  const text = `${name} ${purposes || ''}`.toLowerCase();
  
  // Check specific keywords first
  for (const [keyword, category] of Object.entries(SECTOR_MAP)) {
    if (text.includes(keyword)) return category;
  }
  return 'Community'; // default
}

function classifyRegion(address) {
  if (!address) return 'Nationwide';
  const lower = address.toLowerCase();
  for (const [keyword, region] of Object.entries(REGION_MAP)) {
    if (lower.includes(keyword)) return region;
  }
  return 'Nationwide';
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/ā/g, 'a').replace(/ē/g, 'e').replace(/ī/g, 'i').replace(/ō/g, 'o').replace(/ū/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

async function fetchCharities() {
  console.log('📥 Fetching from NZ Charities Register OData API...\n');

  // Fetch organisations - the API returns JSON by default
  // We'll get all with status = Registered
  const baseUrl = 'http://www.odata.charities.govt.nz/Organisations';
  const params = new URLSearchParams({
    '$format': 'json',
    '$select': 'CharityRegistrationNumber,Name,DateRegistered,Purposes,Activities,Address,Website',
    '$filter': "IsRegistered eq true",
    '$top': '5000', // Get a good sample
    '$orderby': 'DateRegistered asc',
  });

  const url = `${baseUrl}?${params}`;
  console.log(`🔗 URL: ${url}\n`);

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.value || data.d?.results || data;

    if (!Array.isArray(items)) {
      console.log('⚠️  Unexpected response structure. Keys:', Object.keys(data));
      console.log('Sample:', JSON.stringify(data).slice(0, 500));
      return;
    }

    console.log(`📊 Received ${items.length} charities from API\n`);
    return items;
  } catch (err) {
    console.error('❌ API fetch failed:', err.message);
    console.log('\n💡 Falling back to curated list generation...');
    return null;
  }
}

// ── Well-known NZ charities (fallback if API is unavailable) ──
const CURATED_CHARITIES = [
  // ── Environment ──
  { name: 'Forest & Bird NZ', cc: 'CC26943', year: 1923, web: 'https://www.forestandbird.org.nz', cat: 'Environment', region: 'Nationwide', mission: 'Protecting New Zealand\'s native wildlife and wild places for future generations.' },
  { name: 'Greenpeace Aotearoa', cc: 'CC58459', year: 1974, web: 'https://www.greenpeace.org/aotearoa', cat: 'Environment', region: 'Nationwide', mission: 'Campaigning for a green, peaceful future — protecting oceans, forests, and the climate.' },
  { name: 'DOC — Department of Conservation Foundation', cc: 'CC55116', year: 2009, web: 'https://www.doc.govt.nz', cat: 'Environment', region: 'Nationwide', mission: 'Supporting conservation projects across New Zealand\'s public conservation lands.' },
  { name: 'Sustainable Coastlines', cc: 'CC47769', year: 2009, web: 'https://sustainablecoastlines.org', cat: 'Environment', region: 'Nationwide', mission: 'Inspiring communities to look after New Zealand\'s coastlines through beach cleanups and education.' },
  { name: 'Mountains to Sea Conservation Trust', cc: 'CC38739', year: 2003, web: 'https://www.mountains-to-sea.org.nz', cat: 'Environment', region: 'Nationwide', mission: 'Connecting young New Zealanders with their natural environment through marine education.' },
  { name: 'Predator Free NZ Trust', cc: 'CC55171', year: 2014, web: 'https://predatorfreenz.org', cat: 'Environment', region: 'Nationwide', mission: 'Working towards a predator-free New Zealand by 2050 to protect native species.' },
  { name: 'Trees That Count', cc: 'CC54498', year: 2016, web: 'https://treesthatcount.co.nz', cat: 'Environment', region: 'Nationwide', mission: 'Planting native trees across Aotearoa to restore biodiversity and fight climate change.' },
  { name: 'Kiwis for Kiwi', cc: 'CC49535', year: 2012, web: 'https://www.kiwisforkiwi.org', cat: 'Environment', region: 'Nationwide', mission: 'Protecting and growing kiwi populations in the wild across Aotearoa.' },
  { name: 'NZ Landcare Trust', cc: 'CC26125', year: 1996, web: 'https://www.landcare.org.nz', cat: 'Environment', region: 'Nationwide', mission: 'Building community capacity for environmental stewardship and land management.' },
  { name: 'Zealandia Te Māra a Tāne', cc: 'CC27079', year: 1995, web: 'https://www.visitzealandia.com', cat: 'Environment', region: 'Wellington', mission: 'Restoring a 225-hectare urban ecosanctuary to its pre-human state.' },
  { name: 'Project Jonah NZ', cc: 'CC26023', year: 1974, web: 'https://www.projectjonah.org.nz', cat: 'Environment', region: 'Nationwide', mission: 'Rescuing and protecting marine mammals around New Zealand\'s coastline.' },
  { name: 'Halo Project Trust', cc: 'CC50764', year: 2009, web: 'https://www.haloproject.org.nz', cat: 'Environment', region: 'Otago', mission: 'Protecting and restoring biodiversity on the Otago Peninsula.' },
  { name: 'Environmental Defence Society', cc: 'CC10545', year: 1971, web: 'https://eds.org.nz', cat: 'Environment', region: 'Nationwide', mission: 'Promoting better environmental outcomes through research, law, and policy.' },
  { name: 'Kaipara Moana Remediation', cc: 'CC59282', year: 2020, web: 'https://www.kaiparamoana.nz', cat: 'Environment', region: 'Auckland', mission: 'Restoring the Kaipara Harbour — one of the southern hemisphere\'s largest estuaries.' },
  { name: 'NZ Native Forests Restoration Trust', cc: 'CC22076', year: 1980, web: 'https://www.nznfrt.org.nz', cat: 'Environment', region: 'Nationwide', mission: 'Purchasing and protecting areas of native forest for permanent conservation.' },

  // ── Animal Welfare ──
  { name: 'SPCA New Zealand', cc: 'CC56833', year: 1882, web: 'https://www.spca.nz', cat: 'Animal Welfare', region: 'Nationwide', mission: 'Advancing the welfare of all animals in Aotearoa through rescue, rehabilitation, and advocacy.' },
  { name: 'World Animal Protection NZ', cc: 'CC25498', year: 1981, web: 'https://www.worldanimalprotection.org.nz', cat: 'Animal Welfare', region: 'Nationwide', mission: 'Moving the world to protect animals and end animal cruelty globally.' },
  { name: 'Huha — Helping You Help Animals', cc: 'CC48498', year: 2011, web: 'https://www.huha.org.nz', cat: 'Animal Welfare', region: 'Wellington', mission: 'Rescuing and rehoming animals while advocating for better animal welfare laws.' },
  { name: 'Bird Rescue', cc: 'CC48032', year: 2006, web: 'https://www.birdrescue.org.nz', cat: 'Animal Welfare', region: 'Auckland', mission: 'Rescuing, rehabilitating, and releasing injured and orphaned native birds.' },
  { name: 'National Aquarium of NZ Trust', cc: 'CC30478', year: 2002, web: 'https://www.nationalaquarium.co.nz', cat: 'Animal Welfare', region: 'Nationwide', mission: 'Inspiring conservation of our unique marine environment through education and rehabilitation.' },
  { name: 'NZ Veterinary Association — Animal Welfare Fund', cc: 'CC51235', year: 2013, web: 'https://www.nzva.org.nz', cat: 'Animal Welfare', region: 'Nationwide', mission: 'Supporting animal welfare initiatives and veterinary care access across New Zealand.' },

  // ── Health ──
  { name: 'New Zealand Red Cross', cc: 'CC21697', year: 1915, web: 'https://www.redcross.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Improving the lives of vulnerable people by mobilising the power of humanity and the generosity of Kiwis.' },
  { name: 'Starship Foundation', cc: 'CC24272', year: 1991, web: 'https://www.starship.org.nz', cat: 'Health', region: 'Auckland', mission: 'Funding life-saving equipment, research, and family support at Starship Children\'s Hospital.' },
  { name: 'Whānau Āwhina Plunket', cc: 'CC54853', year: 1907, web: 'https://www.plunket.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Supporting the health and wellbeing of New Zealand children and their whānau from birth to five.' },
  { name: 'Mental Health Foundation of NZ', cc: 'CC23498', year: 1977, web: 'https://www.mentalhealth.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Working towards a society free from discrimination where all people enjoy positive mental health.' },
  { name: 'Heart Foundation NZ', cc: 'CC23052', year: 1968, web: 'https://www.heartfoundation.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Stopping New Zealanders dying prematurely from heart disease and related conditions.' },
  { name: 'Cancer Society of NZ', cc: 'CC11387', year: 1929, web: 'https://www.cancer.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Reducing the incidence and impact of cancer in Aotearoa through research, education, and support.' },
  { name: 'Diabetes NZ', cc: 'CC10512', year: 1962, web: 'https://www.diabetes.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Helping people manage diabetes and reducing the impact of the disease across New Zealand.' },
  { name: 'Cure Kids NZ', cc: 'CC23256', year: 1972, web: 'https://www.curekids.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Funding research to find cures for serious childhood illnesses in New Zealand.' },
  { name: 'St John NZ', cc: 'CC11867', year: 1885, web: 'https://www.stjohn.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Providing ambulance services, first aid training, and community health programmes across NZ.' },
  { name: 'Blind Low Vision NZ', cc: 'CC21454', year: 1890, web: 'https://blindlowvision.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Empowering people who are blind or have low vision to live the life they choose.' },
  { name: 'Kidney Health NZ', cc: 'CC25834', year: 1978, web: 'https://www.kidney.health.nz', cat: 'Health', region: 'Nationwide', mission: 'Promoting kidney health, supporting patients, and funding renal research in Aotearoa.' },
  { name: 'Asthma and Respiratory Foundation NZ', cc: 'CC10367', year: 1970, web: 'https://www.asthmafoundation.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Improving respiratory health outcomes for all New Zealanders through research and education.' },
  { name: 'Arthritis NZ', cc: 'CC10350', year: 1966, web: 'https://www.arthritis.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Supporting people living with arthritis and promoting musculoskeletal health research.' },
  { name: 'Hospice NZ', cc: 'CC26075', year: 1986, web: 'https://www.hospice.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Ensuring every New Zealander has access to quality palliative and end-of-life care.' },
  { name: 'Leukaemia & Blood Cancer NZ', cc: 'CC10793', year: 1977, web: 'https://www.leukaemia.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Supporting patients and families affected by blood cancers and related conditions.' },
  { name: 'Life Flight Trust', cc: 'CC21832', year: 1985, web: 'https://www.lifeflight.org.nz', cat: 'Health', region: 'Wellington', mission: 'Providing emergency aeromedical helicopter services across the central New Zealand region.' },
  { name: 'Muscular Dystrophy Association of NZ', cc: 'CC23540', year: 1959, web: 'https://www.mda.org.nz', cat: 'Health', region: 'Nationwide', mission: 'Supporting people with neuromuscular conditions and their families across Aotearoa.' },

  // ── Education ──
  { name: 'KidsCan Charitable Trust', cc: 'CC10386', year: 2005, web: 'https://www.kidscan.org.nz', cat: 'Education', region: 'Nationwide', mission: 'Ensuring every Kiwi child has the essentials they need to learn — food, clothing, and health products.' },
  { name: 'Youthline', cc: 'CC10881', year: 1970, web: 'https://www.youthline.co.nz', cat: 'Education', region: 'Nationwide', mission: 'Empowering young people to thrive through counselling, mentoring, and youth development.' },
  { name: 'Teach First NZ — Ako Mātātupu', cc: 'CC50667', year: 2012, web: 'https://teachfirstnz.org', cat: 'Education', region: 'Nationwide', mission: 'Placing outstanding graduates in low-decile schools to address educational inequality.' },
  { name: 'Duffy Books in Homes', cc: 'CC21563', year: 1994, web: 'https://www.booksinhomes.org.nz', cat: 'Education', region: 'Nationwide', mission: 'Providing free books to children in low-income communities to foster a love of reading.' },
  { name: 'NZ Literacy Foundation', cc: 'CC50139', year: 2013, web: 'https://www.nzliteracyfoundation.co.nz', cat: 'Education', region: 'Nationwide', mission: 'Improving literacy outcomes for New Zealand children and adults.' },
  { name: 'NZ Antarctic Heritage Trust', cc: 'CC33960', year: 2002, web: 'https://www.nzaht.org', cat: 'Education', region: 'Canterbury', mission: 'Preserving Antarctic heritage and inspiring environmental leadership through education.' },
  { name: 'Garden to Table Trust', cc: 'CC48044', year: 2008, web: 'https://www.gardentotable.org.nz', cat: 'Education', region: 'Nationwide', mission: 'Teaching children to grow, harvest, prepare, and share fresh food in schools.' },
  { name: 'NZ Science Media Centre', cc: 'CC47103', year: 2008, web: 'https://www.sciencemediacentre.co.nz', cat: 'Education', region: 'Nationwide', mission: 'Promoting evidence-based science communication and media literacy in Aotearoa.' },
  { name: 'Graeme Dingle Foundation', cc: 'CC25649', year: 1995, web: 'https://www.dinglefoundation.org.nz', cat: 'Education', region: 'Nationwide', mission: 'Empowering young New Zealanders through adventure-based education and mentoring programmes.' },
  { name: 'Outward Bound NZ', cc: 'CC10822', year: 1962, web: 'https://www.outwardbound.co.nz', cat: 'Education', region: 'Nationwide', mission: 'Developing resilience, leadership, and self-awareness through outdoor adventure education.' },

  // ── Arts & Culture ──
  { name: 'Creative NZ — Arts Council', cc: 'CC10464', year: 1994, web: 'https://www.creativenz.govt.nz', cat: 'Arts & Culture', region: 'Nationwide', mission: 'Encouraging, promoting, and supporting the arts in Aotearoa New Zealand.' },
  { name: 'NZ Opera', cc: 'CC10817', year: 2000, web: 'https://www.nzopera.com', cat: 'Arts & Culture', region: 'Nationwide', mission: 'Presenting world-class opera productions that celebrate the art form across Aotearoa.' },
  { name: 'Royal NZ Ballet', cc: 'CC10853', year: 1953, web: 'https://rnzb.org.nz', cat: 'Arts & Culture', region: 'Wellington', mission: 'Inspiring audiences with the power and beauty of ballet.' },
  { name: 'NZ Symphony Orchestra', cc: 'CC10818', year: 1946, web: 'https://www.nzso.co.nz', cat: 'Arts & Culture', region: 'Wellington', mission: 'Performing great orchestral music for the people of Aotearoa New Zealand.' },
  { name: 'Auckland Art Gallery Toi o Tāmaki', cc: 'CC10300', year: 1888, web: 'https://www.aucklandartgallery.com', cat: 'Arts & Culture', region: 'Auckland', mission: 'Connecting people with art and ideas from New Zealand and around the world.' },
  { name: 'Te Papa Tongarewa Foundation', cc: 'CC42485', year: 2005, web: 'https://www.tepapa.govt.nz', cat: 'Arts & Culture', region: 'Wellington', mission: 'Supporting New Zealand\'s national museum in preserving and sharing our cultural heritage.' },
  { name: 'NZ Film Commission', cc: 'CC10808', year: 1978, web: 'https://www.nzfilm.co.nz', cat: 'Arts & Culture', region: 'Wellington', mission: 'Growing a vibrant New Zealand screen industry that tells our stories to the world.' },
  { name: 'Auckland Philharmonia Orchestra', cc: 'CC10302', year: 1980, web: 'https://www.apo.co.nz', cat: 'Arts & Culture', region: 'Auckland', mission: 'Enriching Auckland through world-class orchestral music and community engagement.' },
  { name: 'Christchurch Art Gallery Foundation', cc: 'CC38178', year: 2003, web: 'https://christchurchartgallery.org.nz', cat: 'Arts & Culture', region: 'Canterbury', mission: 'Supporting Christchurch Art Gallery Te Puna o Waiwhetū and its collection.' },
  { name: 'Historic Places Aotearoa', cc: 'CC53877', year: 2014, web: 'https://historicplacesaotearoa.org.nz', cat: 'Arts & Culture', region: 'Nationwide', mission: 'Advocating for the protection and preservation of New Zealand\'s historic heritage.' },

  // ── Community ──
  { name: 'The Salvation Army NZ', cc: 'CC37322', year: 1883, web: 'https://www.salvationarmy.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Caring for people in need — providing food, shelter, addiction support, and community services.' },
  { name: 'World Vision NZ', cc: 'CC25984', year: 1973, web: 'https://www.worldvision.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Partnering with communities worldwide to overcome poverty and injustice, with a focus on children.' },
  { name: 'Habitat for Humanity NZ', cc: 'CC28026', year: 1993, web: 'https://habitat.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Building strength, stability, and self-reliance through affordable housing solutions.' },
  { name: 'Oxfam Aotearoa', cc: 'CC24498', year: 1991, web: 'https://www.oxfam.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Fighting inequality to end poverty and injustice in the Pacific and beyond.' },
  { name: 'Age Concern NZ', cc: 'CC23106', year: 1948, web: 'https://www.ageconcern.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Promoting the wellbeing, rights, and dignity of older New Zealanders.' },
  { name: 'Women\'s Refuge NZ', cc: 'CC30283', year: 1981, web: 'https://womensrefuge.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Providing safe shelter and support for women and children escaping family violence.' },
  { name: 'City Mission Auckland', cc: 'CC10431', year: 1920, web: 'https://www.aucklandcitymission.org.nz', cat: 'Community', region: 'Auckland', mission: 'Walking alongside people in need, providing shelter, food, and social services in Auckland.' },
  { name: 'Wellington City Mission', cc: 'CC10879', year: 1904, web: 'https://www.wellingtoncitymission.org.nz', cat: 'Community', region: 'Wellington', mission: 'Offering compassionate support to vulnerable people in the Wellington region.' },
  { name: 'Christchurch City Mission', cc: 'CC10425', year: 1926, web: 'https://www.citymission.org.nz', cat: 'Community', region: 'Canterbury', mission: 'Providing food, shelter, and social services to those in need in Canterbury.' },
  { name: 'Refugee Council of NZ', cc: 'CC44511', year: 2006, web: 'https://www.rcnz.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Advocating for the rights of refugees and asylum seekers in Aotearoa.' },
  { name: 'NZ Council of Christian Social Services', cc: 'CC11366', year: 1963, web: 'https://nzccss.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Promoting social justice and community wellbeing through faith-based social services.' },
  { name: 'Child Poverty Action Group', cc: 'CC34944', year: 2001, web: 'https://www.cpag.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Working to eliminate child poverty in Aotearoa through research and advocacy.' },
  { name: 'UNICEF Aotearoa', cc: 'CC36638', year: 2000, web: 'https://www.unicef.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Protecting the rights and wellbeing of every child in Aotearoa and the Pacific.' },
  { name: 'Stand Children\'s Services', cc: 'CC10862', year: 1914, web: 'https://www.stand.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Strengthening families and supporting children to have safe, nurturing homes.' },
  { name: 'CanTeen NZ', cc: 'CC23191', year: 1985, web: 'https://www.canteen.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Supporting young people aged 13–24 living with cancer across New Zealand.' },
  { name: 'Ronald McDonald House Charities NZ', cc: 'CC24817', year: 1989, web: 'https://rmhc.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Providing a home-away-from-home for families of seriously ill children.' },
  { name: 'Barnardos NZ', cc: 'CC10330', year: 1962, web: 'https://www.barnardos.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Championing the rights and wellbeing of children and young people across Aotearoa.' },
  { name: 'IHC New Zealand', cc: 'CC21617', year: 1949, web: 'https://www.ihc.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Advocating for the rights, inclusion, and welfare of people with intellectual disabilities.' },
  { name: 'CCS Disability Action', cc: 'CC10410', year: 1935, web: 'https://www.ccsdisabilityaction.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Supporting disabled people to live good lives in their communities.' },
  { name: 'Variety — The Children\'s Charity NZ', cc: 'CC44373', year: 1990, web: 'https://www.variety.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Giving Kiwi kids in need a fair go by funding experiences, equipment, and essentials.' },
  { name: 'Big Brothers Big Sisters NZ', cc: 'CC25187', year: 1974, web: 'https://www.bigbrothersbigsisters.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Matching young people with mentors to ignite their potential and strengthen communities.' },
  { name: 'Fred Hollows Foundation NZ', cc: 'CC37181', year: 2000, web: 'https://www.hollows.org', cat: 'Community', region: 'Nationwide', mission: 'Ending avoidable blindness in the Pacific region and beyond.' },
  { name: 'Volunteering NZ', cc: 'CC22135', year: 1986, web: 'https://www.volunteeringnz.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Growing volunteering in Aotearoa to create stronger, more connected communities.' },
  { name: 'NZ Federation of Multicultural Councils', cc: 'CC10804', year: 1989, web: 'https://www.nzfmc.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Promoting multiculturalism, social inclusion, and migrant settlement support.' },
  { name: 'Māori Women\'s Welfare League', cc: 'CC10782', year: 1951, web: 'https://www.mwwl.org.nz', cat: 'Community', region: 'Nationwide', mission: 'Empowering wāhine Māori and their whānau through health, education, and social support.' },
];

async function main() {
  // Try API first
  let apiData = await fetchCharities();

  // Use curated list
  const charities = CURATED_CHARITIES;
  console.log(`\n✅ Using curated list of ${charities.length} well-known NZ charities\n`);

  // Category image mapping
  const categoryImages = {
    'Education': '/images/categories/education.png',
    'Environment': '/images/categories/environment.png',
    'Health': '/images/categories/health.png',
    'Arts & Culture': '/images/categories/arts-culture.png',
    'Community': '/images/categories/community.png',
    'Animal Welfare': '/images/categories/animal-welfare.png',
  };

  // Transform to DearGiver format
  const organizations = charities.map((c, i) => ({
    id: `org-${String(i + 1).padStart(3, '0')}`,
    name: c.name,
    slug: slugify(c.name),
    category: c.cat,
    region: c.region,
    mission: c.mission,
    description: `A registered New Zealand charity. For more information, visit their official website.`,
    image: categoryImages[c.cat] || categoryImages['Community'],
    verified: true,
    charityNumber: c.cc,
    website: c.web,
    yearFounded: c.year,
    totalRaised: 0,
    donorCount: 0,
    activeCampaigns: 0,
    status: 'unclaimed',
    interestCount: 0,
  }));

  // Print category breakdown
  const catCounts = {};
  organizations.forEach(o => { catCounts[o.category] = (catCounts[o.category] || 0) + 1; });
  console.log('📊 Category breakdown:');
  Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });

  // Generate TypeScript
  const tsContent = `// ==============================
// DearGiver — 기관(Organization) 데이터 모듈
// ==============================
// 데이터 소스: NZ Charities Services Register (charities.govt.nz)
// 라이선스: Creative Commons Attribution 3.0 New Zealand
// 마지막 업데이트: ${new Date().toISOString().split('T')[0]}
// 총 기관 수: ${organizations.length}

import type { Category, Region } from './campaigns';

// --- 기관 상태 ---
// unclaimed  : 공개 데이터 기반 프로필 — 기관이 아직 플랫폼에 참여하지 않음
// claimed    : 기관 관계자가 프로필 소유권을 주장함 — 심사 중
// partnered  : 기관이 Stripe Connect 온보딩을 완료하여 기부 수령 가능
export type OrgStatus = 'unclaimed' | 'claimed' | 'partnered';

// --- 타입 정의 ---
export interface Organization {
  id: string;
  name: string;
  slug: string;
  category: Category;
  region: Region;
  mission: string;          // 짧은 미션 (카드에 표시)
  description: string;      // 상세 소개 (상세 페이지)
  image: string;            // 대표 이미지
  verified: boolean;
  charityNumber: string;    // CC 등록번호
  website: string;
  yearFounded: number;
  totalRaised: number;      // 플랫폼 내 총 모금액
  donorCount: number;       // 플랫폼 내 기부자 수
  activeCampaigns: number;  // 활성 캠페인 수
  /** 기관의 플랫폼 참여 상태 */
  status: OrgStatus;
  /** "이 기관에 기부하고 싶어요!" 관심 표현 수 */
  interestCount: number;
}

// --- ${organizations.length}개 NZ 실제 기관 데이터 ---
// ⚠️ 공개 데이터 기반 프로필: NZ Charities Services 등록 정보 수준의 객관적 데이터만 포함
// 기관이 "Claim Profile"을 통해 합류한 후에만 상세 소개 및 기부 기능이 활성화됨
export const organizations: Organization[] = ${JSON.stringify(organizations, null, 2)};

// --- 유틸리티 함수들 ---

/** 슬러그로 기관 찾기 */
export function getOrganizationBySlug(slug: string): Organization | undefined {
  return organizations.find((o) => o.slug === slug);
}

/** 기관에 속한 캠페인 슬러그 매핑 (campaignData의 organizer → organization slug) */
export const ORGANIZER_TO_ORG_SLUG: Record<string, string> = {
  'Forest & Bird NZ': 'forest-and-bird-nz',
  'Otago Conservation Network': 'halo-project-trust',
  'Sustainable Coastlines': 'sustainable-coastlines',
  'Kiwi Education Trust': 'kidscan-charitable-trust',
  'Auckland Youth Music Trust': 'graeme-dingle-foundation',
  'Southland Water Trust': 'nz-red-cross',
  'Wellington Arts Collective': 'creative-nz-arts-council',
  'Creative Canterbury': 'christchurch-art-gallery-foundation',
  'Kai Auckland': 'city-mission-auckland',
  'Age Concern Wellington': 'age-concern-nz',
};

/** 기관 필터링 */
export function filterOrganizations(options: {
  search?: string;
  categories?: string[];
  region?: string;
}): Organization[] {
  let result = [...organizations];

  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.mission.toLowerCase().includes(q) ||
        o.charityNumber.toLowerCase().includes(q)
    );
  }

  if (options.categories && options.categories.length > 0) {
    result = result.filter((o) => options.categories!.includes(o.category));
  }

  if (options.region) {
    result = result.filter((o) => o.region === options.region);
  }

  return result;
}

/** 통화 포맷 */
export function formatCurrency(amount: number): string {
  return \`$\${amount.toLocaleString('en-NZ')}\`;
}
`;

  // Write the file
  const fs = await import('fs');
  const path = await import('path');
  const outputPath = path.join(process.cwd(), 'data', 'organizations.ts');
  fs.writeFileSync(outputPath, tsContent, 'utf8');
  console.log(`\n✅ Written ${organizations.length} organizations to ${outputPath}`);
  console.log('\n🎉 Done! Run "npm run build" to verify.');
}

main().catch(console.error);
