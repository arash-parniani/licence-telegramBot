const { Telegraf, Markup } = require("telegraf");
const { connectDB } = require("./config/db");
require("dotenv").config();


const User = require("./models/User");
const Licence = require("./models/Licence");

const bot = new Telegraf(process.env.BOT_TOKEN);


const startCommand = async (ctx) => {
  const telegramId = ctx.from.id;
  const username = ctx.from.username || 'nousername';

  try {
    let user = await User.findOne({ _id: telegramId });

    if (!user) {
      user = await User.create({
        _id: telegramId,
        date: Date.now(),
        username,
        role: 'user',
      });
    }

    ctx.reply(`سلام خوش اومدی  ${username}`, Markup.inlineKeyboard([
      [Markup.button.callback('فروشگاه 🛍', 'shop')],
      [Markup.button.callback('مشخصات من 🥷', 'info')],
    ]));
  } catch (err) {
    console.log(err);
  }
};


const info = async (ctx) => {
  const telegramId = ctx.from.id;

  try {
    const user = await User.findOne({ _id: telegramId });

    if (user) {
      ctx.reply(`مشخصات شما: \n\nنام کاربری: ${user.username}🥷 \nنوع حساب: ${user.role}🎭 \nزمان ساخت حساب: ${user.date}⌛️`);
    }
  } catch (err) {
    console.log(err);
  }
};


const Help = (ctx) => {
  ctx.reply(`سلام! این راهنمای ربات برای ادمین ربات است:\n\nبرای اضافه کردن محصول: /add name price licence\nبرای حذف محصول: /delete name\nدریافت لیست محصولات: /licence`);
};


const Shop = async (ctx) => {
  try {
    const licences = await Licence.find();

    if (licences.length === 0) {
      return ctx.reply("هیچ محصولی موجود نیست 🥷");
    }

    const buttons = licences.map((item) => {
      return [Markup.button.callback(item.name, `licence_${item._id}`)];
    });

    await ctx.reply("🔑 لایسنس‌های موجود:", Markup.inlineKeyboard(buttons));
  } catch (err) {
    console.log(err);
    ctx.reply("خطا در دریافت محصولات 🥷");
  }
};


const AddLicence = async (ctx) => {
  const [name, price, licence] = ctx.message.text.split(" ").slice(1);

  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ _id: telegramId });

    if (user.role !== 'admin') {
      return ctx.reply('شما مجاز به استفاده این بخش نیستید');
    }

    if (!name || !price || !licence) {
      return ctx.reply('برای راهنمایی بیشتر دستور /help رو ارسال کن 🥷');
    }

    const newLicence = new Licence({ name, price, licence });
    await newLicence.save();
    ctx.reply(`لایسنس "${name}" با موفقیت اضافه شد.`);
  } catch (err) {
    ctx.reply("خطا در افزودن لایسنس!");
    console.log(err);
  }
};


const DeleteLicence = async (ctx) => {
  const name = ctx.message.text.split(" ").slice(1);

  try {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ _id: telegramId });

    if (user.role !== 'admin') {
      return ctx.reply('شما مجاز به استفاده این بخش نیستید');
    }

    if (!name) {
      return ctx.reply('برای راهنمایی بیشتر دستور /help رو ارسال کن 🥷');
    }

    const result = await Licence.findOneAndDelete({ name });

    if (result) {
      ctx.reply(`لایسنس "${name}" با موفقیت حذف شد.`);
    } else {
      ctx.reply(`لایسنسی با نام "${name}" یافت نشد.`);
    }
  } catch (err) {
    ctx.reply("خطا در حذف لایسنس!");
    console.log(err);
  }
};


const ListLicence = async (ctx) => {
  try {
    const licences = await Licence.find();

    if (!licences.length) {
      return ctx.reply("هیچ لایسنس موجود نیست.");
    }

    const buttons = licences.map(licence => [
      Markup.button.callback(licence.name, `show_${licence._id}`)
    ]);

    await ctx.reply('لیست لایسنس‌ها:', {
      reply_markup: {
        inline_keyboard: buttons
      }
    });
  } catch (err) {
    console.error(err);
    ctx.reply("خطا در دریافت لایسنس‌ها");
  }
};


const handleCallbackQuery = async (ctx) => {
    const data = ctx.callbackQuery.data;
  
    if (data.startsWith("licence_")) {
      const id = data.split("licence_")[1];
  
      try {
        const licence = await Licence.findById(id);
  
        if (!licence) {
          return ctx.reply("لایسنس مورد نظر پیدا نشد 🥷");
        }
  
        await ctx.reply(
          `🔐 نام: ${licence.name}\n💸 قیمت: ${licence.price} تومان`,
          Markup.inlineKeyboard([
            [Markup.button.url("💳 پرداخت", `http://${process.env.PAYMENT_URL}${licence.price}`)]
          ])
        );
      } catch (err) {
        console.log(err);
        ctx.reply("خطا در دریافت اطلاعات لایسنس 😓");
      }
    }
  };
  


bot.start(startCommand);
bot.action('info', info);
bot.action('shop', Shop);
bot.command('add', AddLicence);
bot.command('delete', DeleteLicence);
bot.command('help', Help);
bot.command('licence', ListLicence);
bot.on('callback_query', handleCallbackQuery);


connectDB();
bot.launch();
