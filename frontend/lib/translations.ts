export type Language = 'en' | 'hi' | 'gu';

export interface Translations {
  nav: {
    home: string;
    analyze: string;
    ask: string;
    compare: string;
    checklist: string;
    lawyerPrep: string;
    loaded: string;
    plainLanguageAi: string;
    selectLanguage: string;
  };
  home: {
    heroBadge: string;
    heroTitlePart1: string;
    heroTitleGradient: string;
    heroSubtitle: string;
    analyzeNow: string;
    compareDocs: string;
    instantSample: string;
    featuresBadge: string;
    featuresTitle: string;
    featuresSubtitle: string;
    bento1Title: string;
    bento1Desc: string;
    bento2Title: string;
    bento2Desc: string;
    bento3Title: string;
    bento3Desc: string;
    bento4Title: string;
    bento4Desc: string;
    bento5Title: string;
    bento5Desc: string;
    howItWorksBadge: string;
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    privacyBadge: string;
    privacyTitle: string;
    privacySubtitle: string;
    privacy1: string;
    privacy2: string;
    privacy3: string;
    privacy4: string;
    footerText: string;
  };
  analyze: {
    title: string;
    subtitle: string;
    tagline: string;
    heading: string;
    description: string;
    tabUpload: string;
    tabPaste: string;
    dragDropText: string;
    orBrowse: string;
    pasteLabel: string;
    pastePlaceholder: string;
    analyzeButton: string;
    loadSampleButton: string;
    stageUploading: string;
    stageSimplifying: string;
    stageRisks: string;
    executiveSummary: string;
    keyTakeaways: string;
    clauseMatrix: string;
    clauseMatrixDesc: string;
    potentialRisk: string;
    attentionNeeded: string;
    standardTerms: string;
    practicalExplanation: string;
    exactExcerpt: string;
    nextSteps: string;
    askQuestions: string;
    viewChecklist: string;
    lawyerBrief: string;
    newAnalysis: string;
  };
  ask: {
    title: string;
    subtitle: string;
    noDocTitle: string;
    noDocDesc: string;
    analyzeFirst: string;
    loadSample: string;
    loadedDoc: string;
    inputPlaceholder: string;
    send: string;
    thinking: string;
    suggestedInquiries: string;
    suggested1: string;
    suggested2: string;
    suggested3: string;
    sourceExcerpt: string;
    showSource: string;
    hideSource: string;
    highConfidence: string;
    medConfidence: string;
    lowConfidence: string;
  };
  compare: {
    title: string;
    subtitle: string;
    introBadge: string;
    introTitle: string;
    introDesc: string;
    docA: string;
    docB: string;
    tabUpload: string;
    tabPaste: string;
    pastePlaceholderA: string;
    pastePlaceholderB: string;
    dragDropText: string;
    compareButton: string;
    loadSampleButton: string;
    summaryTitle: string;
    pointsTitle: string;
    pointsDesc: string;
    moreFavorable: string;
    docAFavorable: string;
    docBFavorable: string;
    neutralFavorable: string;
    note: string;
  };
  checklist: {
    title: string;
    subtitle: string;
    noDocTitle: string;
    noDocDesc: string;
    progressTitle: string;
    completedOf: string;
    allVerified: string;
    beforeSigningTitle: string;
    beforeSigningDesc: string;
    checkAll: string;
    uncheckAll: string;
    questionsTitle: string;
    questionsDesc: string;
    readyTitle: string;
    readyDesc: string;
    downloadBrief: string;
    quickPreview: string;
    loadSample: string;
    uploadDoc: string;
  };
  lawyerPrep: {
    title: string;
    subtitle: string;
    pageTitle: string;
    pageDesc: string;
    confidentialBrief: string;
    preparedForReview: string;
    summarySection: string;
    keyCommitmentsSection: string;
    clausesSection: string;
    questionsSection: string;
    printBrief: string;
    downloadPdf: string;
    downloaded: string;
    disclaimer: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: 'Home',
      analyze: 'Analyze',
      ask: 'Ask',
      compare: 'Compare',
      checklist: 'Checklist',
      lawyerPrep: 'Lawyer-Prep',
      loaded: 'Loaded',
      plainLanguageAi: 'Plain-Language AI',
      selectLanguage: 'Language',
    },
    home: {
      heroBadge: 'Zero-Data-Retention · In-Memory Privacy Guaranteed',
      heroTitlePart1: 'Understand Any Legal Document in ',
      heroTitleGradient: 'Plain Language',
      heroSubtitle: 'Upload leases, employment contracts, NDAs, or terms of service. Our AI identifies hidden traps, translates legalese into simple everyday language, and prepares targeted questions for your attorney.',
      analyzeNow: 'Analyze a Document Now',
      compareDocs: 'Compare Two Contracts',
      instantSample: 'Try with Sample Contract',
      featuresBadge: 'Comprehensive Legal Toolkit',
      featuresTitle: 'Everything You Need Before Signing',
      featuresSubtitle: 'Explore five powerful AI tools crafted to protect your rights, spot one-sided clauses, and save hours of confusion.',
      bento1Title: 'Multi-Stage Analysis',
      bento1Desc: 'Translates convoluted legal jargon into straightforward English with instant high-risk clause classification.',
      bento2Title: 'Grounded Q&A Chat',
      bento2Desc: 'Ask specific questions and get answers cited directly from contract paragraphs with confidence scoring.',
      bento3Title: 'Pre-Signing Checklist',
      bento3Desc: 'An interactive, step-by-step verification checklist ensuring you never sign away key rights by accident.',
      bento4Title: 'Contract Comparison',
      bento4Desc: 'Compare two contract versions side-by-side to highlight fee changes, liability traps, and favorable terms.',
      bento5Title: 'Lawyer Consultation Prep',
      bento5Desc: 'Generate a structured, professional PDF brief to take to your attorney and save hundreds in billable hours.',
      howItWorksBadge: 'Simple 3-Step Process',
      howItWorksTitle: 'How It Works',
      howItWorksSubtitle: 'From dense legalese to plain clarity in less than 30 seconds.',
      step1Title: 'Upload or Paste Document',
      step1Desc: 'Drag and drop any PDF agreement or paste contract text directly into our secure interface.',
      step2Title: 'Instant In-Memory AI Processing',
      step2Desc: 'Our specialized legal model analyzes clauses, extracts key commitments, and scores potential risks.',
      step3Title: 'Review, Ask & Prepare',
      step3Desc: 'Read plain summaries, chat with your contract, track your signing checklist, and export consultation briefs.',
      privacyBadge: 'Privacy & Security Guarantee',
      privacyTitle: 'Your Data Never Leaves Ephemeral Memory',
      privacySubtitle: 'We built this assistant with zero permanent storage architecture from day one.',
      privacy1: 'No database storage of your uploaded documents or text',
      privacy2: 'Automatic session eviction from memory',
      privacy3: 'No third-party training on your proprietary contract data',
      privacy4: 'Immediate temporary file deletion upon text extraction',
      footerText: 'AI Legal Document Assistant · In-Memory Confidential Legal Simplification · Empowering consumers and businesses',
    },
    analyze: {
      title: 'Analyze Legal Document',
      subtitle: 'Plain-language breakdown & risk detection',
      tagline: 'Instant In-Memory Legal Intelligence',
      heading: 'Upload Your Agreement for Plain-Language Analysis',
      description: 'Upload any PDF agreement or paste raw contract text. Our model breaks down dense legalese, highlights one-sided terms, and pinpoints hidden liability traps in seconds.',
      tabUpload: 'Upload PDF Document',
      tabPaste: 'Paste Contract Text',
      dragDropText: 'Drop your PDF agreement here, or',
      orBrowse: 'browse to upload',
      pasteLabel: 'Contract or Agreement Text',
      pastePlaceholder: 'Paste the full text of your lease, employment contract, NDA, or service agreement here (minimum 30 characters)…',
      analyzeButton: 'Analyze Document',
      loadSampleButton: 'Load Sample Agreement',
      stageUploading: 'Reading document & extracting text…',
      stageSimplifying: 'Simplifying legalese & summarizing…',
      stageRisks: 'Scanning for hidden traps & one-sided risks…',
      executiveSummary: 'Executive Plain-Language Summary',
      keyTakeaways: 'Key Commitments & Important Takeaways',
      clauseMatrix: 'Clause Risk Classification Matrix',
      clauseMatrixDesc: 'Every clause evaluated for fairness, liability exposure, and one-sided language.',
      potentialRisk: 'Potential Risk',
      attentionNeeded: 'Attention Needed',
      standardTerms: 'Standard Terms',
      practicalExplanation: 'Practical Explanation',
      exactExcerpt: 'Exact Contract Excerpt',
      nextSteps: 'Next Steps & Actions',
      askQuestions: 'Ask Questions in Q&A Chat',
      viewChecklist: 'View Pre-Signing Checklist',
      lawyerBrief: 'Prepare Lawyer Consultation Brief',
      newAnalysis: 'Analyze Another Document',
    },
    ask: {
      title: 'Contract Q&A Assistant',
      subtitle: 'Grounded clause-level answers & source citations',
      noDocTitle: 'No Document Currently Loaded',
      noDocDesc: 'To ask questions and receive answers strictly grounded in contract clauses, please analyze a document or load a sample contract.',
      analyzeFirst: 'Analyze a Document First',
      loadSample: 'Load Sample Contract',
      loadedDoc: 'Contract Loaded',
      inputPlaceholder: 'Ask any question about rent, notice periods, liability, termination…',
      send: 'Send',
      thinking: 'Searching contract clauses…',
      suggestedInquiries: 'Suggested Inquiries:',
      suggested1: 'Under what conditions can the security deposit be withheld?',
      suggested2: 'What is the required notice period for termination?',
      suggested3: 'What are the penalties or late fees for delayed payments?',
      sourceExcerpt: 'Exact Contract Excerpt',
      showSource: 'Show Contract Source Excerpt',
      hideSource: 'Hide Source Excerpt',
      highConfidence: 'High Confidence',
      medConfidence: 'Medium Confidence',
      lowConfidence: 'Low Confidence',
    },
    compare: {
      title: 'Compare Legal Documents',
      subtitle: 'Side-by-side term & liability evaluation',
      introBadge: 'Intelligent Difference & Favorability Detection',
      introTitle: 'Compare Two Contracts Side-by-Side',
      introDesc: 'Upload two versions of an agreement or competing proposals. Our AI highlights key differences in rent, liabilities, notice windows, and identifies which terms are more favorable.',
      docA: 'Document A (Original / Option 1)',
      docB: 'Document B (Revised / Option 2)',
      tabUpload: 'Upload PDF',
      tabPaste: 'Paste Text',
      pastePlaceholderA: 'Paste text of Document A…',
      pastePlaceholderB: 'Paste text of Document B…',
      dragDropText: 'Drop PDF here or browse',
      compareButton: 'Compare Documents',
      loadSampleButton: 'Load Sample Comparison (Contract A vs B)',
      summaryTitle: 'Comparative Executive Summary',
      pointsTitle: 'Side-by-Side Term Differences',
      pointsDesc: 'Direct comparison across financial obligations, liabilities, and legal risk terms.',
      moreFavorable: 'More Favorable Term:',
      docAFavorable: 'Document A is more favorable',
      docBFavorable: 'Document B is more favorable',
      neutralFavorable: 'Terms are comparable / neutral',
      note: 'Analytical Note',
    },
    checklist: {
      title: 'Pre-Signing Checklist',
      subtitle: 'Context-aware verification & questions',
      noDocTitle: 'No Active Document Loaded',
      noDocDesc: 'To generate a personalized pre-signing verification checklist with questions to ask your counterparty or legal counsel, please analyze a document first.',
      progressTitle: 'Verification Progress',
      completedOf: 'completed',
      allVerified: 'All Verified!',
      beforeSigningTitle: 'Before Signing Checklist',
      beforeSigningDesc: 'Click anywhere on a row to check off an obligation',
      checkAll: 'Check All',
      uncheckAll: 'Uncheck All',
      questionsTitle: 'Questions to Ask Before Signing',
      questionsDesc: 'Targeted inquiries referencing identified contract clauses',
      readyTitle: 'Ready for Professional Legal Review?',
      readyDesc: 'Export your verified checklist, flagged risk clauses, and targeted questions as a clean brief for your attorney.',
      downloadBrief: 'Prepare Lawyer Consultation Brief',
      quickPreview: 'Quick Preview Brief',
      loadSample: 'Load Sample Checklist',
      uploadDoc: 'Upload / Analyze Document',
    },
    lawyerPrep: {
      title: 'Lawyer Consultation Prep',
      subtitle: 'Printable brief & client PDF export',
      pageTitle: 'Lawyer Consultation Preparation Brief',
      pageDesc: 'Preview your generated consultation brief below. Download as a clean, structured PDF to share directly with your attorney or retain for pre-signing negotiations.',
      confidentialBrief: 'CONFIDENTIAL LEGAL BRIEF',
      preparedForReview: 'Prepared for Legal Review',
      summarySection: '1. Executive Plain-Language Summary',
      keyCommitmentsSection: 'Key Commitments & Takeaways:',
      clausesSection: '2. Clauses to Discuss (Flagged Risk & Attention Items)',
      questionsSection: '3. Targeted Questions to Ask Legal Counsel',
      printBrief: 'Print Brief',
      downloadPdf: 'Download PDF Brief',
      downloaded: 'Downloaded Successfully!',
      disclaimer: 'Disclaimer: This document is an AI-generated preparatory aid to facilitate productive consultations with licensed attorneys. It does not constitute formal legal advice.',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      analyze: 'विश्लेषण',
      ask: 'प्रश्न पूछें',
      compare: 'तुलना करें',
      checklist: 'चेकलिस्ट',
      lawyerPrep: 'वकील परामर्श तैयारी',
      loaded: 'लोड किया गया',
      plainLanguageAi: 'सरल भाषा AI',
      selectLanguage: 'भाषा',
    },
    home: {
      heroBadge: 'शून्य डेटा प्रतिधारण · पूर्ण गोपनीयता की गारंटी',
      heroTitlePart1: 'किसी भी कानूनी दस्तावेज़ को समझें ',
      heroTitleGradient: 'सरल और स्पष्ट भाषा में',
      heroSubtitle: 'किराया अनुबंध, रोजगार अनुबंध, एनडीए या सेवा की शर्तें अपलोड करें। हमारा AI छुपे जोखिमों की पहचान करता है, कानूनी भाषा को सरल बनाता है और आपके वकील के लिए सवाल तैयार करता है।',
      analyzeNow: 'दस्तावेज़ का विश्लेषण करें',
      compareDocs: 'दो अनुबंधों की तुलना करें',
      instantSample: 'नमूना अनुबंध के साथ आज़माएं',
      featuresBadge: 'सम्पूर्ण कानूनी टूलकिट',
      featuresTitle: 'हस्ताक्षर करने से पहले सब कुछ जो आपको चाहिए',
      featuresSubtitle: 'अपने अधिकारों की रक्षा करने, एकतरफा शर्तों को पहचानने और समय बचाने के लिए बनाए गए 5 शक्तिशाली AI टूल्स।',
      bento1Title: 'बहु-चरणीय विश्लेषण',
      bento1Desc: 'जटिल कानूनी शब्दावली को तत्काल जोखिम वर्गीकरण के साथ सरल भाषा में अनुवादित करता है।',
      bento2Title: 'दस्तावेज़ आधारित प्रश्नोत्तर चैट',
      bento2Desc: 'विशिष्ट प्रश्न पूछें और अनुबंध के पैराग्राफ से सीधे संदर्भित उत्तर और विश्वसनीयता स्कोर प्राप्त करें।',
      bento3Title: 'हस्ताक्षर-पूर्व चेकलिस्ट',
      bento3Desc: 'एक इंटरैक्टिव चरण-दर-चरण सत्यापन चेकलिस्ट ताकि आप गलती से अपने प्रमुख अधिकार न खो बैठें।',
      bento4Title: 'अनुबंधों की तुलना',
      bento4Desc: 'शुल्क परिवर्तन, दायित्व और अनुकूल शर्तों को उजागर करने के लिए दो अनुबंध संस्करणों की साथ-साथ तुलना करें।',
      bento5Title: 'वकील परामर्श ब्रीफ',
      bento5Desc: 'अपने वकील के पास ले जाने और परामर्श शुल्क में बचत करने के लिए एक संरचित, पेशेवर PDF ब्रीफ तैयार करें।',
      howItWorksBadge: 'सरल 3-चरणीय प्रक्रिया',
      howItWorksTitle: 'यह कैसे काम करता है',
      howItWorksSubtitle: '30 सेकंड से भी कम समय में जटिल कानूनी भाषा से स्पष्ट समझ तक।',
      step1Title: 'दस्तावेज़ अपलोड या पेस्ट करें',
      step1Desc: 'कोई भी PDF अनुबंध खींचें और छोड़ें या सीधे अनुबंध टेक्स्ट पेस्ट करें।',
      step2Title: 'तत्काल इन-मेमोरी AI प्रोसेसिंग',
      step2Desc: 'हमारा विशेष कानूनी मॉडल धाराओं का विश्लेषण करता है और संभावित जोखिमों का स्कोर बनाता है।',
      step3Title: 'समीक्षा करें, पूछें और तैयारी करें',
      step3Desc: 'सरल सारांश पढ़ें, अपने अनुबंध से चैट करें, चेकलिस्ट ट्रैक करें और ब्रीफ निर्यात करें।',
      privacyBadge: 'गोपनीयता और सुरक्षा गारंटी',
      privacyTitle: 'आपका डेटा कभी भी मेमोरी से बाहर नहीं जाता',
      privacySubtitle: 'हमने इस सहायक को पहले दिन से ही शून्य स्थायी भंडारण आर्किटेक्चर के साथ बनाया है।',
      privacy1: 'आपके अपलोड किए गए दस्तावेज़ों का कोई डेटाबेस भंडारण नहीं',
      privacy2: 'मेमोरी से स्वचालित सत्र निष्कासन',
      privacy3: 'आपके अनुबंध डेटा पर कोई तृतीय-पक्ष मॉडल प्रशिक्षण नहीं',
      privacy4: 'टेक्स्ट निकालने के तुरंत बाद अस्थायी फ़ाइलें हटाई जाती हैं',
      footerText: 'AI कानूनी दस्तावेज़ सहायक · इन-मेमोरी गोपनीय कानूनी सरलीकरण · उपभोक्ता और व्यावसायिक सुरक्षा',
    },
    analyze: {
      title: 'कानूनी दस्तावेज़ का विश्लेषण',
      subtitle: 'सरल भाषा सारांश और जोखिम पहचान',
      tagline: 'त्वरित इन-मेमोरी कानूनी विश्लेषण',
      heading: 'सरल भाषा विश्लेषण के लिए अपना अनुबंध अपलोड करें',
      description: 'कोई भी PDF अनुबंध अपलोड करें या टेक्स्ट पेस्ट करें। हमारा मॉडल जटिल कानूनी भाषा को तोड़ता है, एकतरफा शर्तों को उजागर करता है और संभावित जोखिमों की पहचान करता है।',
      tabUpload: 'PDF दस्तावेज़ अपलोड करें',
      tabPaste: 'अनुबंध टेक्स्ट पेस्ट करें',
      dragDropText: 'अपना PDF अनुबंध यहाँ खींचें और छोड़ें, या',
      orBrowse: 'फ़ाइल चुनने के लिए क्लिक करें',
      pasteLabel: 'अनुबंध या समझौते का टेक्स्ट',
      pastePlaceholder: 'अपने लीज, रोज़गार अनुबंध, NDA या सेवा समझौते का पूरा टेक्स्ट यहाँ पेस्ट करें (न्यूनतम 30 अक्षर)…',
      analyzeButton: 'दस्तावेज़ का विश्लेषण करें',
      loadSampleButton: 'नमूना अनुबंध लोड करें',
      stageUploading: 'दस्तावेज़ पढ़ा जा रहा है और टेक्स्ट निकाला जा रहा है…',
      stageSimplifying: 'कानूनी भाषा को सरल बनाया जा रहा है…',
      stageRisks: 'छिपे हुए जोखिमों और एकतरफा शर्तों की जांच हो रही है…',
      executiveSummary: 'कार्यकारी सरल-भाषा सारांश',
      keyTakeaways: 'मुख्य प्रतिबद्धताएं और महत्वपूर्ण बिंदु',
      clauseMatrix: 'शर्त जोखिम वर्गीकरण मैट्रिक्स',
      clauseMatrixDesc: 'निष्पक्षता, दायित्व जोखिम और एकतरफा भाषा के लिए प्रत्येक खंड का मूल्यांकन किया गया।',
      potentialRisk: 'संभावित जोखिम',
      attentionNeeded: 'ध्यान देने योग्य',
      standardTerms: 'मानक शर्तें',
      practicalExplanation: 'व्यावहारिक स्पष्टीकरण',
      exactExcerpt: 'अनुबंध का मूल अंश',
      nextSteps: 'अगले कदम और विकल्प',
      askQuestions: 'प्रश्नोत्तर चैट में सवाल पूछें',
      viewChecklist: 'हस्ताक्षर-पूर्व चेकलिस्ट देखें',
      lawyerBrief: 'वकील परामर्श ब्रीफ तैयार करें',
      newAnalysis: 'अन्य दस्तावेज़ का विश्लेषण करें',
    },
    ask: {
      title: 'अनुबंध प्रश्नोत्तर सहायक',
      subtitle: 'सटीक अनुबंध-आधारित उत्तर और स्रोत उद्धरण',
      noDocTitle: 'वर्तमान में कोई दस्तावेज़ लोड नहीं है',
      noDocDesc: 'अनुबंध की धाराओं पर आधारित सटीक उत्तर प्राप्त करने के लिए कृपया पहले एक दस्तावेज़ का विश्लेषण करें या नमूना लोड करें।',
      analyzeFirst: 'पहले एक दस्तावेज़ का विश्लेषण करें',
      loadSample: 'नमूना अनुबंध लोड करें',
      loadedDoc: 'अनुबंध लोड किया गया',
      inputPlaceholder: 'किराया, नोटिस अवधि, दायित्व, समाप्ति के बारे में कोई भी प्रश्न पूछें…',
      send: 'भेजें',
      thinking: 'अनुबंध की धाराओं में खोजा जा रहा है…',
      suggestedInquiries: 'सुझाए गए प्रश्न:',
      suggested1: 'किन शर्तों के तहत सुरक्षा जमा काटी जा सकती है?',
      suggested2: 'अनुबंध समाप्ति के लिए कितनी नोटिस अवधि आवश्यक है?',
      suggested3: 'देरी से भुगतान के लिए क्या जुर्माना या शुल्क हैं?',
      sourceExcerpt: 'अनुबंध का मूल अंश',
      showSource: 'अनुबंध स्रोत का अंश देखें',
      hideSource: 'स्रोत अंश छुपाएं',
      highConfidence: 'उच्च विश्वसनीयता',
      medConfidence: 'मध्यम विश्वसनीयता',
      lowConfidence: 'निम्न विश्वसनीयता',
    },
    compare: {
      title: 'कानूनी दस्तावेज़ों की तुलना करें',
      subtitle: 'शर्तों और देनदारियों का तुलनात्मक मूल्यांकन',
      introBadge: 'बुद्धिमान अंतर और अनुकूलता का पता लगाना',
      introTitle: 'दो अनुबंधों की साथ-साथ तुलना करें',
      introDesc: 'समझौते के दो संस्करण या प्रतिस्पर्धी प्रस्ताव अपलोड करें। हमारा AI किराए, देनदारियों, नोटिस अवधि में मुख्य अंतर दिखाता है और बताता है कि कौन सी शर्तें अधिक अनुकूल हैं।',
      docA: 'दस्तावेज़ A (मूल / विकल्प 1)',
      docB: 'दस्तावेज़ B (संशोधित / विकल्प 2)',
      tabUpload: 'PDF अपलोड करें',
      tabPaste: 'टेक्स्ट पेस्ट करें',
      pastePlaceholderA: 'दस्तावेज़ A का टेक्स्ट पेस्ट करें…',
      pastePlaceholderB: 'दस्तावेज़ B का टेक्स्ट पेस्ट करें…',
      dragDropText: 'PDF फ़ाइल यहाँ छोड़ें या चुनें',
      compareButton: 'दस्तावेज़ों की तुलना करें',
      loadSampleButton: 'नमूना तुलना लोड करें (अनुबंध A बनाम B)',
      summaryTitle: 'तुलनात्मक कार्यकारी सारांश',
      pointsTitle: 'शर्तों में मुख्य अंतर',
      pointsDesc: 'वित्तीय दायित्वों, देनदारियों और कानूनी जोखिमों की प्रत्यक्ष तुलना।',
      moreFavorable: 'अधिक अनुकूल शर्त:',
      docAFavorable: 'दस्तावेज़ A अधिक अनुकूल है',
      docBFavorable: 'दस्तावेज़ B अधिक अनुकूल है',
      neutralFavorable: 'शर्तें समान / तटस्थ हैं',
      note: 'विश्लेषणात्मक टिप्पणी',
    },
    checklist: {
      title: 'हस्ताक्षर-पूर्व चेकलिस्ट',
      subtitle: 'संदर्भ-जागरूक सत्यापन और आवश्यक प्रश्न',
      noDocTitle: 'कोई सक्रिय दस्तावेज़ लोड नहीं है',
      noDocDesc: 'हस्ताक्षर करने से पहले आवश्यक सत्यापन चेकलिस्ट और वकील से पूछने योग्य प्रश्न प्राप्त करने के लिए कृपया पहले दस्तावेज़ का विश्लेषण करें।',
      progressTitle: 'सत्यापन प्रगति',
      completedOf: 'पूर्ण हुए',
      allVerified: 'सभी सत्यापित!',
      beforeSigningTitle: 'हस्ताक्षर से पहले की चेकलिस्ट',
      beforeSigningDesc: 'शर्त को पूरा चिह्नित करने के लिए पंक्ति पर कहीं भी क्लिक करें',
      checkAll: 'सभी चुनें',
      uncheckAll: 'सभी हटाएं',
      questionsTitle: 'हस्ताक्षर करने से पहले पूछने योग्य प्रश्न',
      questionsDesc: 'अनुबंध की पहचानी गई धाराओं पर आधारित लक्षित प्रश्न',
      readyTitle: 'पेशेवर कानूनी समीक्षा के लिए तैयार?',
      readyDesc: 'अपने सत्यापित चेकलिस्ट, जोखिम बिंदुओं और प्रश्नों को अपने वकील के लिए एक साफ ब्रीफ के रूप में निर्यात करें।',
      downloadBrief: 'वकील परामर्श ब्रीफ तैयार करें',
      quickPreview: 'त्वरित पूर्वावलोकन ब्रीफ',
      loadSample: 'नमूना चेकलिस्ट लोड करें',
      uploadDoc: 'दस्तावेज़ अपलोड / विश्लेषण करें',
    },
    lawyerPrep: {
      title: 'वकील परामर्श तैयारी',
      subtitle: 'प्रिंट करने योग्य ब्रीफ और क्लाइंट PDF निर्यात',
      pageTitle: 'वकील परामर्श तैयारी ब्रीफ',
      pageDesc: 'नीचे अपना तैयार परामर्श ब्रीफ देखें। अपने वकील के साथ सीधे साझा करने या बातचीत में उपयोग के लिए एक संरचित PDF के रूप में डाउनलोड करें।',
      confidentialBrief: 'गोपनीय कानूनी ब्रीफ',
      preparedForReview: 'कानूनी समीक्षा हेतु तैयार',
      summarySection: '1. कार्यकारी सरल-भाषा सारांश',
      keyCommitmentsSection: 'मुख्य प्रतिबद्धताएं और निष्कर्ष:',
      clausesSection: '2. चर्चा के लिए शर्तें (पहचाने गए जोखिम बिंदु)',
      questionsSection: '3. कानूनी वकील से पूछने योग्य लक्षित प्रश्न',
      printBrief: 'ब्रीफ प्रिंट करें',
      downloadPdf: 'PDF ब्रीफ डाउनलोड करें',
      downloaded: 'सफलतापूर्वक डाउनलोड किया गया!',
      disclaimer: 'अस्वीकरण: यह दस्तावेज़ लाइसेंस प्राप्त वकीलों के साथ उत्पादक परामर्श की सुविधा के लिए AI-निर्मित तैयारी सहायता है। यह औपचारिक कानूनी सलाह नहीं है।',
    },
  },
  gu: {
    nav: {
      home: 'હોમ',
      analyze: 'વિશ્લેષણ',
      ask: 'પ્રશ્ન પૂછો',
      compare: 'સરખામણી કરો',
      checklist: 'ચેકલિસ્ટ',
      lawyerPrep: 'વકીલ પરામર્શ તૈયારી',
      loaded: 'લોડ કરેલ',
      plainLanguageAi: 'સરળ ભાષા AI',
      selectLanguage: 'ભાષા',
    },
    home: {
      heroBadge: 'શૂન્ય ડેટા સંગ્રહ · સંપૂર્ણ ગોપનીયતાની ખાતરી',
      heroTitlePart1: 'કોઈપણ કાનૂની દસ્તાવેજ સમજો ',
      heroTitleGradient: 'સરળ અને સ્પષ્ટ ભાષામાં',
      heroSubtitle: 'ભાડા કરાર, નોકરી કરાર, એનડીએ અથવા સેવાની શરતો અપલોડ કરો. અમારું AI છુપાયેલા જોખમો ઓળખે છે, કાનૂની ભાષાને સરળ બનાવે છે અને તમારા વકીલ માટે પ્રશ્નો તૈયાર કરે છે.',
      analyzeNow: 'દસ્તાવેજનું વિશ્લેષણ કરો',
      compareDocs: 'બે કરારોની સરખામણી કરો',
      instantSample: 'નમૂના કરાર સાથે અજમાવો',
      featuresBadge: 'સંપૂર્ણ કાનૂની ટૂલકિટ',
      featuresTitle: 'સહી કરતા પહેલાં તમને જોઈતી દરેક બાબત',
      featuresSubtitle: 'તમારા અધિકારોનું રક્ષણ કરવા, એકતરફી શરતો ઓળખવા અને સમય બચાવવા માટે રચાયેલા 5 શક્તિશાળી AI ટૂલ્સ.',
      bento1Title: 'બહુ-તબક્કાવાર વિશ્લેષણ',
      bento1Desc: 'જટિલ કાનૂની ભાષાને ત્વરિત જોખમ વર્ગીકરણ સાથે સીધી સાદી ગુજરાતી ભાષામાં રૂપાંતરિત કરે છે.',
      bento2Title: 'દસ્તાવેજ આધારિત પ્રશ્નોત્તરી ચેટ',
      bento2Desc: 'ચોક્કસ પ્રશ્નો પૂછો અને કરારના ફકરાઓમાંથી સીધા સંદર્ભિત જવાબો અને વિશ્વસનીયતા સ્કોર મેળવો.',
      bento3Title: 'સહી-પૂર્વે ચકાસણી ચેકલિસ્ટ',
      bento3Desc: 'એક ઇન્ટરેક્ટિવ પગલાવાર ચેકલિસ્ટ જેથી તમે અજાણતાં તમારા મહત્વપૂર્ણ અધિકારો ગુમાવી ન દો.',
      bento4Title: 'કરારોની સરખામણી',
      bento4Desc: 'ફી ફેરફારો, જવાબદારીની જાળ અને અનુકૂળ શરતો તપાસવા માટે બે કરાર સંસ્કરણોની સાથે-સાથે સરખામણી કરો.',
      bento5Title: 'વકીલ પરામર્શ બ્રીફ',
      bento5Desc: 'તમારા વકીલ પાસે લઈ જવા અને પરામર્શ ફી બચાવવા માટે એક સુવ્યવસ્થિત, વ્યાવસાયિક PDF બ્રીફ તૈયાર કરો.',
      howItWorksBadge: 'સરળ 3-પગલાંની પ્રક્રિયા',
      howItWorksTitle: 'તે કેવી રીતે કાર્ય કરે છે',
      howItWorksSubtitle: '30 સેકન્ડથી પણ ઓછા સમયમાં જટિલ કાનૂની ભાષામાંથી સ્પષ્ટ સમજણ.',
      step1Title: 'દસ્તાવેજ અપલોડ અથવા પેસ્ટ કરો',
      step1Desc: 'કોઈપણ PDF કરાર ડ્રેગ કરો અથવા સીધો કરાર ટેક્સ્ટ પેસ્ટ કરો.',
      step2Title: 'ત્વરિત ઇન-મેમરી AI પ્રોસેસિંગ',
      step2Desc: 'અમારું વિશિષ્ટ કાનૂની મૉડલ શરતોનું વિશ્લેષણ કરે છે અને સંભવિત જોખમોનો સ્કોર આપે છે.',
      step3Title: 'સમીક્ષા કરો, પૂછો અને તૈયારી કરો',
      step3Desc: 'સરળ સારાંશ વાંચો, તમારા કરાર સાથે ચેટ કરો, ચેકલિસ્ટ ટ્રૅક કરો અને બ્રીફ નિકાસ કરો.',
      privacyBadge: 'ગોપનીયતા અને સુરક્ષા ખાતરી',
      privacyTitle: 'તમારો ડેટા ક્યારેય મેમરી બહાર જતો નથી',
      privacySubtitle: 'અમે આ સહાયકને પ્રથમ દિવસથી જ શૂન્ય કાયમી સંગ્રહ આર્કિટેક્ચર સાથે બનાવ્યું છે.',
      privacy1: 'તમારા અપલોડ કરેલા દસ્તાવેજોનો કોઈ ડેટાબેઝ સંગ્રહ નથી',
      privacy2: 'મેમરીમાંથી સ્વચાલિત સત્ર નિકાલ',
      privacy3: 'તમારા કરાર ડેટા પર કોઈ તૃતીય-પક્ષ તાલીમ નથી',
      privacy4: 'ટેક્સ્ટ કાઢ્યા પછી તરત જ કામચલાઉ ફાઇલો કાઢી નાખવામાં આવે છે',
      footerText: 'AI કાનૂની દસ્તાવેજ સહાયક · ઇન-મેમરી ગોપનીય કાનૂની સરળીકરણ · ગ્રાહક અને વ્યવસાયિક રક્ષણ',
    },
    analyze: {
      title: 'કાનૂની દસ્તાવેજનું વિશ્લેષણ',
      subtitle: 'સરળ ભાષા સારાંશ અને જોખમ ઓળખ',
      tagline: 'ત્વરિત ઇન-મેમરી કાનૂની વિશ્લેષણ',
      heading: 'સરળ ભાષા વિશ્લેષણ માટે તમારો કરાર અપલોડ કરો',
      description: 'કોઈપણ PDF કરાર અપલોડ કરો અથવા ટેક્સ્ટ પેસ્ટ કરો. અમારું મૉડલ જટિલ કાનૂની ભાષાને સરળ બનાવે છે અને છુપાયેલા જોખમો ઓળખે છે.',
      tabUpload: 'PDF દસ્તાવેજ અપલોડ કરો',
      tabPaste: 'કરાર ટેક્સ્ટ પેસ્ટ કરો',
      dragDropText: 'તમારો PDF કરાર અહીં મૂકો, અથવા',
      orBrowse: 'ફાઇલ પસંદ કરવા ક્લિક કરો',
      pasteLabel: 'કરાર અથવા કરારનામું ટેક્સ્ટ',
      pastePlaceholder: 'તમારા ભાડા કરાર, રોજગાર કરાર, NDA અથવા સેવા કરારનો સંપૂર્ણ ટેક્સ્ટ અહીં પેસ્ટ કરો (ઓછામાં ઓછા 30 અક્ષરો)…',
      analyzeButton: 'દસ્તાવેજનું વિશ્લેષણ કરો',
      loadSampleButton: 'નમૂના કરાર લોડ કરો',
      stageUploading: 'દસ્તાવેજ વાંચવામાં આવી રહ્યો છે અને ટેક્સ્ટ કાઢવામાં આવી રહ્યો છે…',
      stageSimplifying: 'કાનૂની ભાષાને સરળ બનાવવામાં આવી રહી છે…',
      stageRisks: 'છુપાયેલા જોખમો અને એકતરફી શરતોની તપાસ થઈ રહી છે…',
      executiveSummary: 'કાર્યકારી સરળ-ભાષા સારાંશ',
      keyTakeaways: 'મુખ્ય પ્રતિબદ્ધતાઓ અને મહત્વપૂર્ણ મુદ્દાઓ',
      clauseMatrix: 'કલમ જોખમ વર્ગીકરણ મેટ્રિક્સ',
      clauseMatrixDesc: 'ન્યાયીપણા, જવાબદારીના જોખમ અને એકતરફી ભાષા માટે દરેક કલમનું મૂલ્યાંકન કરવામાં આવ્યું.',
      potentialRisk: 'સંભવિત જોખમ',
      attentionNeeded: 'ધ્યાન આપવાની જરૂર છે',
      standardTerms: 'પ્રમાણભૂત શરતો',
      practicalExplanation: 'વ્યવહારુ સમજૂતી',
      exactExcerpt: 'કરારનો મૂળ અંશ',
      nextSteps: 'આગળનાં પગલાં અને વિકલ્પો',
      askQuestions: 'પ્રશ્નોત્તરી ચેટમાં પ્રશ્નો પૂછો',
      viewChecklist: 'સહી-પૂર્વે ચેકલિસ્ટ જુઓ',
      lawyerBrief: 'વકીલ પરામર્શ બ્રીફ તૈયાર કરો',
      newAnalysis: 'અન્ય દસ્તાવેજનું વિશ્લેષણ કરો',
    },
    ask: {
      title: 'કરાર પ્રશ્નોત્તરી સહાયક',
      subtitle: 'ચોક્કસ કરાર-આધારિત જવાબો અને સ્ત્રોત સંદર્ભો',
      noDocTitle: 'હાલમાં કોઈ દસ્તાવેજ લોડ થયેલ નથી',
      noDocDesc: 'કરારની શરતો પર આધારિત ચોક્કસ જવાબો મેળવવા માટે કૃપા કરીને પહેલાં દસ્તાવેજનું વિશ્લેષણ કરો અથવા નમૂનો લોડ કરો.',
      analyzeFirst: 'પહેલાં દસ્તાવેજનું વિશ્લેષણ કરો',
      loadSample: 'નમૂના કરાર લોડ કરો',
      loadedDoc: 'કરાર લોડ થયેલ છે',
      inputPlaceholder: 'ભાડું, નોટિસ અવધિ, જવાબદારી, સમાપ્તિ વિશે કોઈપણ પ્રશ્ન પૂછો…',
      send: 'મોકલો',
      thinking: 'કરારની કલમોમાં શોધાઈ રહ્યું છે…',
      suggestedInquiries: 'સૂચવેલા પ્રશ્નો:',
      suggested1: 'કઈ શરતો હેઠળ સિક્યોરિટી ડિપોઝિટ રોકી શકાય છે?',
      suggested2: 'કરાર સમાપ્તિ માટે કેટલી નોટિસ અવધિ જરૂરી છે?',
      suggested3: 'વિલંબિત ચુકવણી માટે શું દંડ અથવા લેટ ફી છે?',
      sourceExcerpt: 'કરારનો મૂળ અંશ',
      showSource: 'કરાર સ્ત્રોત અંશ બતાવો',
      hideSource: 'સ્ત્રોત અંશ છુપાવો',
      highConfidence: 'ઉચ્ચ વિશ્વસનીયતા',
      medConfidence: 'મધ્યમ વિશ્વસનીયતા',
      lowConfidence: 'ઓછી વિશ્વસનીયતા',
    },
    compare: {
      title: 'કાનૂની દસ્તાવેજોની સરખામણી કરો',
      subtitle: 'શરતો અને જવાબદારીઓનું તુલનાત્મક મૂલ્યાંકન',
      introBadge: 'બુદ્ધિશાળી તફાવત અને અનુકૂળતા શોધ',
      introTitle: 'બે કરારોની સાથે-સાથે સરખામણી કરો',
      introDesc: 'કરારના બે સંસ્કરણો અથવા સ્પર્ધાત્મક દરખાસ્તો અપલોડ કરો. અમારું AI ભાડું, જવાબદારીઓ, નોટિસ અવધિમાં મુખ્ય તફાવતો દર્શાવે છે અને જણાવે છે કે કઈ શરતો વધુ અનુકૂળ છે.',
      docA: 'દસ્તાવેજ A (મૂળ / વિકલ્પ 1)',
      docB: 'દસ્તાવેજ B (સુધારેલ / વિકલ્પ 2)',
      tabUpload: 'PDF અપલોડ કરો',
      tabPaste: 'ટેક્સ્ટ પેસ્ટ કરો',
      pastePlaceholderA: 'દસ્તાવેજ A નો ટેક્સ્ટ પેસ્ટ કરો…',
      pastePlaceholderB: 'દસ્તાવેજ B નો ટેક્સ્ટ પેસ્ટ કરો…',
      dragDropText: 'PDF ફાઇલ અહીં મૂકો અથવા પસંદ કરો',
      compareButton: 'દસ્તાવેજોની સરખામણી કરો',
      loadSampleButton: 'નમૂના સરખામણી લોડ કરો (કરાર A વિરુદ્ધ B)',
      summaryTitle: 'તુલનાત્મક કાર્યકારી સારાંશ',
      pointsTitle: 'શરતોમાં મુખ્ય તફાવતો',
      pointsDesc: 'નાણાકીય જવાબદારીઓ, જવાબદારીઓ અને કાનૂની જોખમોની સીધી સરખામણી.',
      moreFavorable: 'વધુ અનુકૂળ શરત:',
      docAFavorable: 'દસ્તાવેજ A વધુ અનુકૂળ છે',
      docBFavorable: 'દસ્તાવેજ B વધુ અનુકૂળ છે',
      neutralFavorable: 'શરતો સમાન / તટસ્થ છે',
      note: 'વિશ્લેષણાત્મક નોંધ',
    },
    checklist: {
      title: 'સહી-પૂર્વે ચેકલિસ્ટ',
      subtitle: 'સંદર્ભ-જાગૃત ચકાસણી અને જરૂરી પ્રશ્નો',
      noDocTitle: 'કોઈ સક્રિય દસ્તાવેજ લોડ થયેલ નથી',
      noDocDesc: 'સહી કરતા પહેલાં વ્યક્તિગત ચકાસણી ચેકલિસ્ટ અને વકીલને પૂછવા જેવા પ્રશ્નો મેળવવા માટે કૃપા કરીને પહેલાં દસ્તાવેજનું વિશ્લેષણ કરો.',
      progressTitle: 'ચકાસણી પ્રગતિ',
      completedOf: 'પૂર્ણ થયા',
      allVerified: 'બધાં ચકાસાયેલ!',
      beforeSigningTitle: 'સહી કરતાં પહેલાંની ચેકલિસ્ટ',
      beforeSigningDesc: 'શરત પૂર્ણ તરીકે ચિહ્નિત કરવા માટે પંક્તિ પર ગમે ત્યાં ક્લિક કરો',
      checkAll: 'બધાં પસંદ કરો',
      uncheckAll: 'બધાં દૂર કરો',
      questionsTitle: 'સહી કરતાં પહેલાં પૂછવા જેવા પ્રશ્નો',
      questionsDesc: 'કરારની ઓળખાયેલી કલમો પર આધારિત લક્ષિત પ્રશ્નો',
      readyTitle: 'વ્યાવસાયિક કાનૂની સમીક્ષા માટે તૈયાર?',
      readyDesc: 'તમારી ચકાસાયેલ ચેકલિસ્ટ, જોખમ મુદ્દાઓ અને પ્રશ્નોને તમારા વકીલ માટે સ્પષ્ટ બ્રીફ તરીકે નિકાસ કરો.',
      downloadBrief: 'વકીલ પરામર્શ બ્રીફ તૈયાર કરો',
      quickPreview: 'ઝડપી પૂર્વાવલોકન બ્રીફ',
      loadSample: 'નમૂના ચેકલિસ્ટ લોડ કરો',
      uploadDoc: 'દસ્તાવેજ અપલોડ / વિશ્લેષણ કરો',
    },
    lawyerPrep: {
      title: 'વકીલ પરામર્શ તૈયારી',
      subtitle: 'પ્રિન્ટ કરી શકાય તેવી બ્રીફ અને ગ્રાહક PDF નિકાસ',
      pageTitle: 'વકીલ પરામર્શ તૈયારી બ્રીફ',
      pageDesc: 'નીચે તમારી તૈયાર પરામર્શ બ્રીફ જુઓ. તમારા વકીલ સાથે સીધી શેર કરવા અથવા વાતચીતમાં ઉપયોગ માટે એક સુવ્યવસ્થિત PDF તરીકે ડાઉનલોડ કરો.',
      confidentialBrief: 'ગોપનીય કાનૂની બ્રીફ',
      preparedForReview: 'કાનૂની સમીક્ષા માટે તૈયાર',
      summarySection: '1. કાર્યકારી સરળ-ભાષા સારાંશ',
      keyCommitmentsSection: 'મુખ્ય પ્રતિબદ્ધતાઓ અને તારણો:',
      clausesSection: '2. ચર્ચા માટેની શરતો (ઓળખાયેલા જોખમ મુદ્દાઓ)',
      questionsSection: '3. કાનૂની વકીલને પૂછવા જેવા લક્ષિત પ્રશ્નો',
      printBrief: 'બ્રીફ પ્રિન્ટ કરો',
      downloadPdf: 'PDF બ્રીફ ડાઉનલોડ કરો',
      downloaded: 'સફળતાપૂર્વક ડાઉનલોડ થઈ!',
      disclaimer: 'અસ્વીકરણ: આ દસ્તાવેજ લાયસન્સ પ્રાપ્ત વકીલો સાથે ઉત્પાદક પરામર્શની સુવિધા માટે AI-નિર્મિત તૈયારી સહાય છે. તે ઔપચારિક કાનૂની સલાહ નથી.',
    },
  },
};

export function getTranslations(lang: string): Translations {
  const code = (lang || 'en').toLowerCase().substring(0, 2) as Language;
  return translations[code] || translations.en;
}
