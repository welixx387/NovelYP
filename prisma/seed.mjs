// Сид базы демо-данными: жанры, ранобэ, главы, обложки (SVG), тестовые пользователи,
// отзывы и комментарии. Запуск: npm run db:seed (или npx prisma db seed).
// Обычный .mjs, а не .ts — чтобы не тянуть tsx/ts-node только ради одного скрипта.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COVERS_DIR = path.join(__dirname, "..", "public", "covers");

function slugify(input) {
  const translit = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return input
    .toLowerCase()
    .split("")
    .map((ch) => translit[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const GENRES = [
  { name: "Фэнтези", slug: "fantasy" },
  { name: "Романтика", slug: "romance" },
  { name: "Экшн", slug: "action" },
  { name: "Приключения", slug: "adventure" },
  { name: "Драма", slug: "drama" },
  { name: "Комедия", slug: "comedy" },
  { name: "Сверхъестественное", slug: "supernatural" },
  { name: "Школа", slug: "school" },
  { name: "Трагедия", slug: "tragedy" },
  { name: "Меха", slug: "mecha" },
  { name: "Исекай", slug: "isekai" },
  { name: "Магия", slug: "magic" },
];

const NOVELS = [
  {
    title: "Хроники Пепельного Клинка",
    author: "Илья Северов",
    status: "ONGOING",
    year: 2023,
    genres: ["fantasy", "action", "adventure"],
    chapters: 16,
    description:
      "После падения Ордена Пепла бывший рыцарь Кайден скрывается под чужим именем. Но клинок, доставшийся ему по наследству, помнит войну — и однажды заставит вспомнить о ней и своего хозяина.",
  },
  {
    title: "Академия Теней",
    author: "Марина Волкова",
    status: "ONGOING",
    year: 2024,
    genres: ["school", "magic", "romance"],
    chapters: 12,
    description:
      "В Академии Теней учат не только колдовать, но и выживать среди тех, кто сильнее. Новенькая Лира не планировала никого впечатлять — она просто хотела найти способ снять проклятие с младшего брата.",
  },
  {
    title: "Последний Страж Порога",
    author: "Артём Гроза",
    status: "COMPLETED",
    year: 2021,
    genres: ["fantasy", "adventure", "drama"],
    chapters: 20,
    description:
      "Порог между мирами не открывался триста лет — пока не открылся снова. Единственный, кто помнит, как его закрывать, давно должен был умереть.",
  },
  {
    title: "Реинкарнация в мире, где я злодейка",
    author: "Юки Танабэ",
    status: "ONGOING",
    year: 2024,
    genres: ["isekai", "comedy", "romance"],
    chapters: 18,
    description:
      "Проснуться в теле второстепенной злодейки из любимой новеллы — не худший вариант. Худший — узнать, что до финальной сцены казни осталось меньше года.",
  },
  {
    title: "Стальное Сердце Дракона",
    author: "Роман Кузнецов",
    status: "ONGOING",
    year: 2022,
    genres: ["fantasy", "action", "drama"],
    chapters: 14,
    description:
      "Кузнец Дарен научился ковать оружие, способное ранить драконов. Он не знал, что однажды ему придётся выковать такое оружие против собственного брата.",
  },
  {
    title: "Тетрадь Забытых Богов",
    author: "Ксения Орлова",
    status: "HIATUS",
    year: 2020,
    genres: ["supernatural", "drama"],
    chapters: 9,
    description:
      "Тетрадь появилась в библиотеке сама по себе. В ней имена богов, которых больше никто не помнит — и с каждой прочитанной страницей один из них просыпается.",
  },
  {
    title: "Клинок, Что Режет Судьбу",
    author: "Дмитрий Лис",
    status: "COMPLETED",
    year: 2019,
    genres: ["action", "tragedy"],
    chapters: 22,
    description:
      "Говорят, этот клинок выбирает хозяина сам — и никогда не ошибается. Никто не предупредил Рэна, что выбор клинка редко бывает милосердным.",
  },
  {
    title: "Восхождение Теневого Мага",
    author: "Николай Ясень",
    status: "ONGOING",
    year: 2023,
    genres: ["fantasy", "magic"],
    chapters: 15,
    description:
      "Магия тени считалась проклятой три века подряд. Эрику было плевать на репутацию — ему нужно было выжить в академии, где его magic-дар мог стоить ему жизни.",
  },
  {
    title: "Пилот Механического Рассвета",
    author: "Сергей Орбита",
    status: "ONGOING",
    year: 2024,
    genres: ["mecha", "action"],
    chapters: 11,
    description:
      "После вторжения на орбите Земли осталась одна боеспособная машина — и один пилот, не готовый её вести. Выбора у него, впрочем, не осталось.",
  },
  {
    title: "Дневник Демонической Принцессы",
    author: "Анна Черных",
    status: "ONGOING",
    year: 2022,
    genres: ["comedy", "romance", "supernatural"],
    chapters: 17,
    description:
      "Быть наследницей демонического трона и одновременно вести дневник для психотерапевта — так себе комбинация. Особенно когда терапевт — экзорцист.",
  },
  {
    title: "Забытое Королевство Льда",
    author: "Виктор Метель",
    status: "COMPLETED",
    year: 2020,
    genres: ["fantasy", "adventure", "drama"],
    chapters: 19,
    description:
      "Королевство подо льдом ждало освободителя тысячу лет. Пришедшая экспедиция искала совсем другое — но лёд решил иначе.",
  },
  {
    title: "Искра в Пустоте",
    author: "Полина Заря",
    status: "ONGOING",
    year: 2025,
    genres: ["isekai", "drama"],
    chapters: 8,
    description:
      "Между мирами есть Пустота, и в ней не выживает ничего живого. Кроме одной искры сознания, упрямо помнящей, кем она была раньше.",
  },
];

const SENTENCE_BANK = [
  "Ветер над башнями крепости пах приближающейся грозой.",
  "Он сжал рукоять оружия крепче, чем следовало бы для простой прогулки по коридору.",
  "Тишина в зале была настолько плотной, что казалось — её можно резать.",
  "Никто из присутствующих не решался произнести вслух то, о чём думали все.",
  "Свет факелов дрожал на каменных стенах, вычерчивая знакомые с детства узоры.",
  "За окном начинался дождь — редкость для этого времени года.",
  "Слова наставника всплыли в памяти сами собой, не вовремя и слишком точно.",
  "На горизонте уже виднелись очертания города, которого не должно было существовать.",
  "Старая карта не врала — просто показывала не то время, что нужно было им.",
  "Единственным звуком оставался стук собственного сердца, слишком громкий для такой тишины.",
  "Кто-то из толпы выкрикнул имя, и всё внутри похолодело.",
  "Клятва, данная три года назад, вдруг перестала казаться такой уж незыблемой.",
  "Тень скользнула по стене — слишком быстро, чтобы быть просто тенью.",
  "Запах моря отсюда, из глубины материка, не должен был доноситься вовсе.",
  "На последней странице дневника чужим почерком было выведено одно-единственное слово.",
  "Разговор оборвался на полуслове, и это молчание сказало больше, чем любые аргументы.",
  "Пальцы сами потянулись к печати, оставленной на запястье много лет назад.",
  "В зале ожидания решения было слышно, как потрескивают догорающие свечи.",
  "То, что ещё вчера казалось легендой, сегодня стояло напротив, дыша и ожидая ответа.",
  "Слишком много совпадений — а совпадений в этой истории уже давно не осталось.",
  "Он знал: стоит сделать этот шаг — и обратной дороги не будет.",
  "Голос за спиной прозвучал ровно там, где полагалось быть глухой стене.",
  "Между союзниками и врагами в последнее время стало подозрительно легко перепутать.",
  "Старший наставник лишь покачал головой — верный знак, что объяснений не будет.",
  "Первый снег в этом году выпал на день раньше положенного, и это не сулило ничего доброго.",
  "Каждый удар сердца отдавался в висках, отсчитывая время, которого оставалось всё меньше.",
  "На гербе, вышитом на плаще незнакомца, был символ, который считался уничтоженным.",
  "Слова благодарности застряли в горле — момент для них давно прошёл.",
  "В воздухе всё ещё стоял запах гари, хотя пожар потушили ещё на рассвете.",
  "Он улыбнулся — впервые за долгое время эта улыбка была настоящей.",
];

function pickRandom(array, count) {
  const copy = [...array];
  const result = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function generateChapterContent(novelTitle, chapterNumber, chapterTitle) {
  const paragraphs = [];
  paragraphs.push(
    `Глава началась там же, где закончилась предыдущая — с ощущения, что «${novelTitle}» ещё не рассказала и половины того, что должна.`
  );
  const bodyParagraphs = pickRandom(SENTENCE_BANK, 10).map((s, i) => {
    const extra = pickRandom(SENTENCE_BANK, 2).join(" ");
    return `${s} ${extra}`;
  });
  paragraphs.push(...bodyParagraphs);
  paragraphs.push(
    `На этом «${chapterTitle}» подходила к концу — но, судя по всему, глава ${chapterNumber + 1} не заставит себя долго ждать.`
  );
  return paragraphs.join("\n\n");
}

const CHAPTER_TITLE_WORDS = [
  "Тень прошлого", "Первый шаг", "Голос из темноты", "Цена клятвы", "Разлом",
  "Незваный гость", "Прежде чем рассветёт", "Эхо забытого", "Точка невозврата",
  "Между строк", "Холод внутри", "Последний довод", "Пламя под пеплом",
  "Не по правилам", "Долг и выбор", "Там, где кончается карта", "Свидетель",
  "Второе дыхание", "Что скрывал наставник", "Порог", "Ложный след", "Расплата",
  "Зов крови", "Момент истины",
];

function coverGradient(seed) {
  const hue1 = (seed * 47) % 360;
  const hue2 = (hue1 + 70) % 360;
  return { c1: `hsl(${hue1}, 70%, 45%)`, c2: `hsl(${hue2}, 70%, 30%)` };
}

function wrapTitle(title, maxCharsPerLine = 14) {
  const words = title.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

function generateCoverSvg(title, seed) {
  const { c1, c2 } = coverGradient(seed);
  const lines = wrapTitle(title);
  const startY = 300 - (lines.length - 1) * 22;
  const tspans = lines
    .map((line, i) => `<tspan x="200" y="${startY + i * 44}">${escapeXml(line)}</tspan>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="600" fill="url(#bg)"/>
  <rect x="0" y="0" width="400" height="600" fill="black" opacity="0.15"/>
  <circle cx="330" cy="90" r="120" fill="white" opacity="0.06"/>
  <circle cx="40" cy="520" r="160" fill="black" opacity="0.12"/>
  <text font-family="Georgia, serif" font-size="34" font-weight="700" fill="white" text-anchor="middle">${tspans}</text>
  <rect x="24" y="24" width="352" height="552" fill="none" stroke="white" stroke-opacity="0.25" stroke-width="1.5"/>
</svg>`;
}

function escapeXml(value) {
  return value.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

async function main() {
  await mkdir(COVERS_DIR, { recursive: true });

  console.log("Создаю жанры...");
  const genreRecords = {};
  for (const genre of GENRES) {
    const record = await prisma.genre.upsert({
      where: { slug: genre.slug },
      create: genre,
      update: {},
    });
    genreRecords[genre.slug] = record;
  }

  console.log("Создаю пользователей...");
  const demoPasswordHash = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    create: {
      email: "demo@example.com",
      name: "Демо Пользователь",
      passwordHash: demoPasswordHash,
      subscription: { create: { status: "NONE" } },
    },
    update: {},
  });
  const readerUser = await prisma.user.upsert({
    where: { email: "reader@example.com" },
    create: {
      email: "reader@example.com",
      name: "Тестовый Читатель",
      passwordHash: demoPasswordHash,
      subscription: { create: { status: "NONE" } },
    },
    update: {},
  });

  console.log("Создаю ранобэ и главы...");
  for (const [index, novel] of NOVELS.entries()) {
    const slug = slugify(novel.title);
    const coverUrl = `/covers/${slug}.svg`;
    await writeFile(path.join(COVERS_DIR, `${slug}.svg`), generateCoverSvg(novel.title, index + 1));

    const existing = await prisma.novel.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  пропускаю «${novel.title}» — уже есть`);
      continue;
    }

    const created = await prisma.novel.create({
      data: {
        slug,
        title: novel.title,
        description: novel.description,
        coverUrl,
        author: novel.author,
        status: novel.status,
        year: novel.year,
        viewCount: Math.floor(Math.random() * 5000) + 100,
        genres: { connect: novel.genres.map((g) => ({ id: genreRecords[g].id })) },
      },
    });

    for (let n = 1; n <= novel.chapters; n++) {
      const chapterTitle = CHAPTER_TITLE_WORDS[(index * 7 + n) % CHAPTER_TITLE_WORDS.length];
      await prisma.chapter.create({
        data: {
          novelId: created.id,
          number: n,
          title: chapterTitle,
          content: generateChapterContent(novel.title, n, chapterTitle),
          isPremium: n % 3 === 0,
          publishedAt: new Date(Date.now() - (novel.chapters - n) * 1000 * 60 * 60 * 24 * 3),
        },
      });
    }

    // Пара отзывов для наглядности рейтинга
    const ratings = pickRandom([4, 5, 5, 3, 5, 4], 2);
    let ratingSum = 0;
    for (const [i, rating] of ratings.entries()) {
      const user = i === 0 ? demoUser : readerUser;
      await prisma.review.create({
        data: {
          novelId: created.id,
          userId: user.id,
          rating,
          text: pickRandom(SENTENCE_BANK, 3).join(" "),
        },
      });
      ratingSum += rating;
    }
    await prisma.novel.update({
      where: { id: created.id },
      data: { ratingSum, ratingCount: ratings.length },
    });

    // Комментарий к первой главе
    const firstChapter = await prisma.chapter.findFirst({ where: { novelId: created.id, number: 1 } });
    if (firstChapter) {
      await prisma.comment.create({
        data: {
          chapterId: firstChapter.id,
          userId: readerUser.id,
          text: "Отличное начало, жду продолжения!",
        },
      });
    }

    console.log(`  готово: «${novel.title}» (${novel.chapters} глав)`);
  }

  console.log("\nГотово. Тестовые аккаунты:");
  console.log("  demo@example.com / password123");
  console.log("  reader@example.com / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
