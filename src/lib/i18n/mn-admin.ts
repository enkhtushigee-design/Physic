// Агуулгын удирдлагын (админ) хэсгийн текст.

export const mnAdmin = {
  title: "Агуулгын удирдлага",
  viewSite: "Сайт руу очих",
  logout: "Гарах",
  dataSource: {
    label: "Өгөгдлийн эх сурвалж",
    supabase: "Supabase",
    local: "Локал файл (.data/content.json) — зөвхөн хөгжүүлэлтэд",
  },

  login: {
    title: "Нэвтрэх",
    intro: "Агуулгын удирдлагад нэвтрэхийн тулд нууц үгээ оруулна уу.",
    password: "Нууц үг",
    submit: "Нэвтрэх",
    wrongPassword: "Нууц үг буруу байна.",
    notConfigured:
      "Админ нууц үг тохируулаагүй байна. ADMIN_PASSWORD болон ADMIN_SESSION_SECRET орчны хувьсагчийг тохируулна уу.",
  },

  nav: {
    content: "Агуулга",
    import: "CSV файлаас оруулах",
  },

  dashboard: {
    heading: "Сэдэв, бүлэг, хичээл",
    intro: "Дараалал нь сайт дээрх суралцах замын дарааллыг шууд тодорхойлно.",
    empty: "Одоогоор сэдэв нэмээгүй байна. Эхний сэдвээ нэмж эхлээрэй.",
    noChapters: "Энэ сэдэвт бүлэг алга.",
    noLessons: "Энэ бүлэгт хичээл алга.",
    addTopic: "Сэдэв нэмэх",
    addChapter: "Бүлэг нэмэх",
    addLesson: "Хичээл нэмэх",
    edit: "Засах",
    moveUp: "Дээш зөөх",
    moveDown: "Доош зөөх",
    draft: "Ноорог",
    noVideo: "Видеогүй",
    open: "Сайт дээр харах",
  },

  fields: {
    title: "Гарчиг",
    slug: "Хаягийн нэр (URL)",
    slugHint:
      "Латин жижиг үсэг, тоо, зураас. Хоосон орхивол гарчгаас автоматаар үүснэ. Өөрчилбөл хуучин холбоос ажиллахаа болино.",
    description: "Тайлбар",
    thumbnailUrl: "Зургийн холбоос",
    thumbnailHint: "Заавал биш. https:// хаягаар эхэлнэ.",
    position: "Дараалал",
    positionHint: (max: number) => `1-ээс ${max} хүртэлх тоо. Хоосон орхивол хамгийн сүүлд нэмэгдэнэ.`,
    published: "Сайт дээр нийтлэх",
    publishedHint: "Сонголтыг арилгавал ноорог болж, зөвхөн энд харагдана.",
    topic: "Сэдэв",
    chapter: "Бүлэг",
    youtube: "YouTube холбоос эсвэл видеоны ID",
    youtubeHint: "Жишээ нь: https://www.youtube.com/watch?v=…, https://youtu.be/…, https://www.youtube.com/shorts/…",
    youtubeDetected: (id: string) => `Видеоны ID: ${id}`,
    duration: "Үргэлжлэх хугацаа",
    durationHint: "Секундээр (754) эсвэл мм:сс (12:34) хэлбэрээр.",
    objectives: "Эзэмших мэдлэг, чадвар",
    objectivesHint: "Мөр бүрт нэгийг бичнэ.",
  },

  actions: {
    save: "Хадгалах",
    saving: "Хадгалж байна...",
    cancel: "Цуцлах",
    delete: "Устгах",
    create: "Нэмэх",
  },

  pages: {
    newTopic: "Шинэ сэдэв",
    editTopic: "Сэдэв засах",
    newChapter: "Шинэ бүлэг",
    editChapter: "Бүлэг засах",
    newLesson: "Шинэ хичээл",
    editLesson: "Хичээл засах",
    dangerZone: "Устгах",
  },

  confirmDelete: {
    topic: "Энэ сэдвийг устгах уу? Доторх бүх бүлэг, хичээл хамт устана. Энэ үйлдлийг буцаах боломжгүй.",
    chapter: "Энэ бүлгийг устгах уу? Доторх бүх хичээл хамт устана. Энэ үйлдлийг буцаах боломжгүй.",
    lesson: "Энэ хичээлийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.",
  },

  flash: {
    saved: "Амжилттай хадгалагдлаа.",
    created: "Амжилттай нэмэгдлээ.",
    deleted: "Амжилттай устгагдлаа.",
  },

  errors: {
    required: "Энэ талбарыг бөглөнө үү.",
    titleTooLong: "Гарчиг 200 тэмдэгтээс хэтрэхгүй байх ёстой.",
    invalidSlug: "Хаягийн нэрэнд зөвхөн латин жижиг үсэг, тоо, зураас (-) ашиглана.",
    reservedSlug: "Энэ хаягийн нэрийг сайт өөрөө ашигладаг тул өөр нэр сонгоно уу.",
    duplicateSlug: "Энэ хаягийн нэр аль хэдийн ашиглагдсан байна.",
    invalidYoutube: "YouTube холбоос буруу байна.",
    invalidDuration: "Үргэлжлэх хугацаа буруу байна. Секундээр эсвэл мм:сс хэлбэрээр оруулна уу.",
    invalidPosition: "Дараалал нь 1-ээс эхэлсэн бүхэл тоо байх ёстой.",
    invalidUrl: "Холбоос https:// хаягаар эхэлсэн байх ёстой.",
    parentMissing: "Сонгосон сэдэв эсвэл бүлэг олдсонгүй.",
    notFound: "Хайсан зүйл олдсонгүй. Устгагдсан байж магадгүй.",
    notConfigured:
      "Мэдээллийн сан тохируулаагүй байна. NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY хувьсагчдыг шалгана уу.",
    unauthorized: "Нэвтрэх эрхийн хугацаа дууссан байна. Дахин нэвтэрнэ үү.",
    generic: "Хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
    fixErrors: "Маягтын алдааг засаад дахин оролдоно уу.",
  },

  import: {
    heading: "CSV файлаас хичээл оруулах",
    intro:
      "Олон хичээлийг нэг дор нэмэхэд зориулав. Файлаа сонгоод эхлээд шалгана. Алдаагүй бол оруулах товч идэвхжинэ.",
    formatHeading: "Файлын бүтэц",
    formatText:
      "Эхний мөрөнд баганын нэрс байна. Заавал байх баганууд: topic_title, chapter_title, lesson_title, youtube_url. Нэмэлт баганууд: description, duration_seconds, order_index, learning_objectives (олон зорилгыг | тэмдгээр тусгаарлана). Байхгүй сэдэв, бүлэг автоматаар үүснэ.",
    downloadTemplate: "Загвар файл татах",
    file: "CSV файл",
    orPaste: "эсвэл агуулгыг энд буулгана уу",
    paste: "CSV агуулга",
    check: "Шалгах",
    checking: "Шалгаж байна...",
    commit: "Оруулах",
    committing: "Оруулж байна...",
    empty: "Файл эсвэл CSV агуулга оруулна уу.",
    tooLarge: "Файлын хэмжээ хэт том байна (дээд тал нь 2 МБ).",
    missingColumns: (cols: string) => `Дараах багана дутуу байна: ${cols}.`,
    noRows: "Файлд өгөгдлийн мөр алга.",
    tooManyRows: (max: number) => `Нэг удаад ${max} хүртэл мөр оруулах боломжтой.`,
    summaryHeading: "Шалгалтын дүн",
    table: {
      line: "Мөр",
      topic: "Сэдэв",
      chapter: "Бүлэг",
      lesson: "Хичээл",
      video: "Видео",
      status: "Төлөв",
    },
    status: { new: "Шинэ", duplicate: "Алгасна", error: "Алдаатай" },
    rowErrors: {
      topicTitle: "Сэдвийн нэр хоосон байна.",
      chapterTitle: "Бүлгийн нэр хоосон байна.",
      lessonTitle: "Хичээлийн нэр хоосон байна.",
      titleTooLong: "Нэр 200 тэмдэгтээс хэтэрсэн байна.",
      youtube: "YouTube холбоос буруу байна.",
      duration: "Үргэлжлэх хугацаа буруу байна.",
      order: "order_index нь эерэг бүхэл тоо байх ёстой.",
    },
    rowWarnings: {
      noVideo: "Видео холбоосгүй тул хичээл видеогүй нэмэгдэнэ.",
      duplicateInFile: "Файл дотор давхардсан мөр.",
      duplicateExisting: "Энэ хичээл аль хэдийн нэмэгдсэн байна.",
      duplicateVideo: "Энэ видео өөр хичээлд аль хэдийн холбогдсон байна.",
    },
    counts: {
      lessons: (n: number) => `${n} шинэ хичээл`,
      topics: (n: number) => `${n} шинэ сэдэв`,
      chapters: (n: number) => `${n} шинэ бүлэг`,
      skipped: (n: number) => `${n} мөрийг алгасна`,
      errors: (n: number) => `${n} алдаатай мөр`,
    },
    hasErrors: "Алдаатай мөрүүдийг засаад дахин шалгана уу. Алдаагүй болсон үед оруулах боломжтой.",
    nothingToImport: "Оруулах шинэ хичээл алга.",
    success: (n: number) => `${n} хичээл амжилттай нэмэгдлээ.`,
    successDetails: (topics: number, chapters: number, skipped: number) => {
      const created = [topics > 0 ? `${topics} шинэ сэдэв` : null, chapters > 0 ? `${chapters} шинэ бүлэг` : null]
        .filter(Boolean)
        .join(", ");
      return [created ? `${created} үүсгэлээ.` : null, skipped > 0 ? `${skipped} давхардсан мөрийг алгаслаа.` : null]
        .filter(Boolean)
        .join(" ");
    },
    partialFailure: (n: number) =>
      `${n} хичээл нэмэгдсэний дараа алдаа гарлаа. Нэмэгдсэн хичээлүүдийг шалгаад, үлдсэнийг дахин оруулна уу.`,
  },
} as const;
