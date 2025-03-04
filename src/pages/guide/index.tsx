import React from "react";
import SimpleTable from "~/features/guide-table";
import {
  direct_Table_Hospital,
  direct_Table_Daro,
  direct_Table_Paziresh_Sabt_Avalie,
  direct_Table_Sabt_Avalie_BedoneBime,
  direct_Table_WithScan,
  direct_Table_WithoutScan,
  direct_Table_Para_Dandan,
  indirect_Table_Hospital,
  inDirect_Table_Daro,
  inDirect_Table_WithoutScan,
  inDirect_Table_Para_Dandan,
} from "~/constants/guide-page-data";

import H2 from "~/ui/heading/h2";

export default function GuidePage() {
  return (
    <main dir="rtl" className="guide__page mx-auto w-10/12 py-10 text-primary">
      <>
        <p>
          <strong>&nbsp;&nbsp; </strong>عملکرد کلی شعب ارزیابی بر اساس عناوین
          زیر قابل بررسی است که به منظور سهولت در تحلیل عملکرد شعب، به تفکیک
          توضیح هر عنوان ارائه می‌گردد:
        </p>
        <ul>
          <li>
            <strong>درصد </strong>
            <strong>میانگین عملکرد پرسنل تمام وقت شعبه </strong>
          </li>
        </ul>
        <p>
          &nbsp;&nbsp; میانگین عملکرد پرسنل تمام وقت شعبه بر اساس استانداردهای
          تعیین شده برای هر فعالیت در طول یک روز است که به شرح زیر بررسی
          می‌گردد: ( جداول این استانداردها در پایان راهنما پیوست گردیده است)
        </p>
        <ul>
          <li>
            <strong>ارزیابی اسناد بیمارستانی:</strong> در صورتی که کارشناس
            ارزیاب اسناد بیمارستانی در طول یک روز کمتر از 25 پرونده (مستقیم و
            غیر مستقیم) را ارزیابی کند عملکرد ایشان ضعیف، اگر 25 تا 35 پرونده را
            ارزیابی نماید عملکرد ایشان خوب و اگر 35 تا 40 پرونده را ارزیابی کند
            عملکرد ایشان عالی است. در صورت ارزیابی بیش از 40 پرونده در طول روز،
            کیفیت ارزیابی توسط واحد فنی بررسی خواهد شد.
          </li>
          <li>
            <strong>ارزیابی اسناد دارویی:</strong> در صورتی که کارشناس ارزیاب
            اسناد دارویی در طول یک روز کمتر از 200 پرونده مستقیم را ارزیابی کند
            عملکرد ایشان ضعیف، اگر 200 تا 250 پرونده را ارزیابی نماید عملکرد
            ایشان خوب و اگر 250 تا 300 پرونده را ارزیابی نماید عملکرد ایشان عالی
            است. در صورت ارزیابی بیش از 300 پرونده در طول روز، کیفیت ارزیابی
            توسط واحد فنی بررسی خواهد شد.
          </li>
        </ul>
        <p>
          <strong>
            <sup>*</sup>
          </strong>
          استاندارد ارزیابی اسناد دارویی غیر مستقیم 1.5 برابر ارزیابی اسناد
          مستقیم است.
        </p>
        <ul>
          <li>
            <strong>پذیرش و ثبت اولیه اسناد در میز خدمت:</strong> در صورتی که
            کارشناس پذیرش در طول یک روز کمتر از 70 پرونده را از بیمه شده دریافت
            و در سامانه ثبت نماید عملکرد ایشان ضعیف، اگر 70 تا 100 پرونده را از
            بیمه شده دریافت و ثبت نماید عملکرد ایشان خوب و اگر 100 تا 130 پرونده
            را از بیمه شده دریافت و ثبت نماید عملکرد ایشان عالی است. در صورت
            پذیرش بیش از 130 پرونده در طول روز، کیفیت کار ایشان توسط واحد فنی
            بررسی خواهد شد.
          </li>
          <li>
            <strong>ثبت اولیه اسناد (بدون پذیرش از بیمه شده):</strong> در صورتی
            که کارشناس پذیرش در طول یک روز کمتر از 300 پرونده را در سامانه ثبت
            اولیه نماید عملکرد ایشان ضعیف، اگر 300 تا 350 پرونده را ثبت اولیه
            نماید عملکرد ایشان خوب و اگر 350 تا 400 پرونده را ثبت اولیه نماید
            عملکرد ایشان عالی است. در صورت ثبت بیش از 400 پرونده در طول روز،
            کیفیت کار ایشان توسط واحد فنی بررسی خواهد شد.
          </li>
        </ul>
        <p>
          <sup>*</sup>پذیرش و ثبت اولیه اسناد فقط مربوط به اسناد مستقیم است.
        </p>
        <ul>
          <li>
            <strong>ثبت ارزیابی با اسکن مدارک:</strong> در صورتی که مبلغ ارزیابی
            شده اسناد پاراکلینیکی و دارویی مستقیم بیشتر از 3 میلیون تومان و مبلغ
            ارزیابی شده اسناد بیمارستانی مستقیم بیشتر از 5 میلیون تومان باشد
            لازم است مستندات مربوط به آن‌ها در سامانه رسا بارگذاری گردد. در حالت
            بارگذاری اسناد در صورتی که کارشناس ثبت اسناد خسارت در طول یک روز
            کمتر از 25 پرونده را در سامانه ثبت و بارگذاری نماید عملکرد ایشان
            ضعیف، در صورتی که 25 تا 35 پرونده را در سامانه ثبت و بارگذاری نماید
            عملکرد ایشان خوب و اگر 35 تا 40 پرونده را در سامانه ثبت و بارگذاری
            نماید عملکرد ایشان عالی است. در صورت ثبت ارزیابی و بارگذاری بیش از
            45 پرونده در طول روز، کیفیت کار ایشان توسط واحد فنی بررسی خواهد شد.
          </li>
        </ul>
        <p>
          <strong>
            <sup>*</sup>
          </strong>
          مستندات اسناد غیر مستقیم با هر مبلغی در سامانه رسا بارگذاری نمی‌گردد.
        </p>
        <ul>
          <li>
            <strong>ثبت ارزیابی بدون اسکن مدارک: </strong>در صورتی که کارشناس
            ثبت اسناد خسارت در طول یک روز کمتر از 250 پرونده مستقیم را در سامانه
            ثبت ارزیابی نماید عملکرد ایشان ضعیف، اگر 250 تا 300 پرونده مستقیم را
            در سامانه ثبت ارزیابی نماید عملکرد ایشان خوب و اگر 300 تا 350 پرونده
            مستقیم را در سامانه ثبت ارزیابی نماید عملکرد ایشان عالی است. در صورت
            ثبت ارزیابی بیش از 350&nbsp; پرونده در طول روز، کیفیت کار ایشان توسط
            واحد فنی بررسی خواهد شد.
          </li>
        </ul>
        <p>
          <strong>
            <sup>*</sup>
          </strong>
          استاندارد ثبت ارزیابی اسناد غیر مستقیم 1.5 برابر ثبت ارزیابی اسناد
          مستقیم است.
        </p>
        <ul>
          <li>
            <strong>ارزیابی اسناد پاراکلینیکی: </strong>در صورتی که کارشناس
            ارزیاب اسناد پاراکلینیکی کمتر از 150 پرونده مستقیم را ارزیابی نماید
            عملکرد ایشان ضعیف، اکر 150 تا 200 پرونده مستقیم را ارزیابی نماید
            عملکرد ایشان خوب و اگر 200 تا 250 پرونده مستقیم را ارزیابی نماید
            عملکرد ایشان عالی است. در صورت ارزیابی بیش از 250 پرونده در طول روز،
            کیفیت ارزیابی توسط واحد فنی بررسی خواهد شد.
          </li>
        </ul>
        <p>
          <sup>*</sup>استاندارد ارزیابی اسناد غیر مستقیم 1.5 برابر ارزیابی اسناد
          مستقیم است.
        </p>
        <ul>
          <li>
            <strong>تعداد پرونده ورودی </strong>
          </li>
        </ul>
        <p>
          &nbsp;&nbsp; تعداد کل پرونده‌های پذیرش شده مستقیم و غیر مستقیم در بازه
          زمانی گزارش است.
        </p>
        <ul>
          <li>
            <strong>تعداد پرونده رسیدگی شده</strong>
          </li>
        </ul>
        <p>
          &nbsp;&nbsp; تعداد کل پرونده‌های ارزیابی شده مستقیم و&nbsp; غیر مستقیم
          در بازه زمانی گزارش است.
        </p>

        <ul>
          <li>
            <strong>تعداد دپو</strong>
          </li>
        </ul>
        <p>
          &nbsp;&nbsp; تعداد کل اسناد رسیدگی نشده مستقیم و غیر مستقیم در بازه
          زمانی گزارش است.
        </p>
        <ul>
          <li>
            <strong>
              درصد عمل به تعهدات از ابتدای ماه تا روز گزارش با تعهد 5 روز (%10+)
            </strong>
          </li>
        </ul>
        <p>
          &nbsp;&nbsp; گزارش درصد عمل به تعهدات از تقسیم «تعداد پرونده مستقیم
          تأیید حواله شده در بازه زمانی کمتر از 5 روز» بر «تعداد کل پرونده
          مستقیم ورودی» در بازه زمانی گزارش به دست می‌آید.
        </p>
        <p>
          <sup>&nbsp;&nbsp;&nbsp; *</sup>پرونده مستقیم تأیید حواله شده، پرونده
          ایست که مراحل ثبت اولیه، ارزیابی و ثبت ارزیابی آن انجام شده و در
          انتظار پرداخت است. با توجه به اینکه فیلتر این گزارش بر اساس ماه ثبت
          پرونده است، گزارشگیری به صورت روزانه حداقل 10 درصد کمتر از مقدار واقعی
          نمایش داده می‌شود.
        </p>
        <ul>
          <li>
            <strong>درصد نسبت رسیدگی پرونده‌های مستقیم (%10+)</strong>
          </li>
        </ul>
        <p>
          &nbsp;&nbsp; گزارش نسبت رسیدگی پرونده‌های مستقیم از تقسیم «تعداد
          پرونده مستقیم رسیدگی شده» بر «تعداد کل پرونده مستقیم ورودی» در بازه
          زمانی گزارش به دست می‌آید. با توجه به اینکه فیلتر این گزارش بر اساس
          ماه ثبت پرونده است، گزارشگیری به صورت روزانه حداقل 10 درصد کمتر از
          مقدار واقعی نمایش داده می‌شود.
        </p>
        <ul>
          <li>
            <strong>درصد نسبت رسیدگی پرونده‌های غیرمستقیم (%10+)</strong>
          </li>
        </ul>
        <p>
          &nbsp;&nbsp; گزارش نسبت رسیدگی پرونده‌های غیر مستقیم از تقسیم «تعداد
          پرونده غیر مستقیم رسیدگی شده» بر «تعداد کل پرونده غیر مستقیم ورودی» در
          بازه زمانی سه ماه گذشته به دست می‌آید. با توجه به اینکه فیلتر این
          گزارش بر اساس ماه ثبت پرونده است، گزارشگیری به صورت روزانه حداقل 10
          درصد کمتر از مقدار واقعی نمایش داده می‌شود.
        </p>
        <ul>
          <li>
            <strong>میانگین مدت زمان تایید حواله تا روز گزارش (روز)</strong>
          </li>
        </ul>
        <p>
          &nbsp;&nbsp; از محاسبه میانگین «حد فاصل ثبت اولیه تا تایید حواله هر
          پرونده» در بازه زمانی گزارش به دست می آید.
        </p>
        <p>
          &nbsp;&nbsp; لازم به آگاهی است نظر به قطع بودن یا کندی سامانه رسا،
          مرخصی بودن پرسنل در یک روز مشخص و نیز فرآیندی بودن فعالیت‌های شعبه از
          مرحله ثبت اولیه اسناد تا ارزیابی، ثبت ارزیابی و تأیید حواله آن‌ها که
          ممکن است طی چند روز کاری انجام گردد، دریافت گزارش به صورت روزانه دارای
          خطا می باشد. بنابراین در کنار گزارشگیری روزانه، گزارشگیری در بازه
          زمانی هفتگی به دلیل تکمیل شدن فرآیندهای کاری و محاسبه میانگین عملکرد
          شعبه منطقی‌تر و دقیق‌تر خواهد بود.
        </p>

        <ul>
          <li>
            <strong>عملکرد کلی شعبه</strong>
          </li>
        </ul>
        <p>
          &nbsp;&nbsp; به منظور بررسی عملکرد کلی شعب برای عناوین توضیح داده شده
          با توجه به میزان اهمیت، ضرایب زیر تعیین گردیده است:
        </p>
        <ul>
          <li>بررسی عملکرد میانگین عملکرد پرسنل تمام وقت شعبه: 0.3</li>
          <li>
            درصد عمل به تعهدات از ابتدای ماه تا روز گزارش با تعهد 5 روز: 0.3
          </li>
          <li>درصد نسبت رسیدگی پرونده‌های مستقیم: 0.3</li>
          <li>درصد نسبت رسیدگی پرونده‌های غیر مستقیم : 0.1</li>
        </ul>
        <p>
          &nbsp;&nbsp; پس از محاسبه درصد عملکرد شعبه که از مجموع حاصل ضرب هریک
          از عناوین نامبرده در ضریب مربوط به آن به دست می‌آید، عملکرد کلی شعبه
          در 4 دسته عالی، خوب، متوسط و ضعیف ارزیابی می‌گردد. درصورتی که درصد
          عملکرد شعبه بیشتر از 90 باشد عملکرد شعبه عالی، در صورتی که بین 75 تا
          90 باشد عملکرد شعبه خوب، در صورتی که بین 60 تا 75 باشد عملکرد شعبه
          متوسط و در صتعداد دپوورتی که کمتر از 60 باشد عملکرد شعبه ضعیف است.
        </p>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <p>
          <strong>
            <span>جداول استاندارد های تعیین شده برای هر فعالیت</span>
          </strong>
        </p>
        <div className="flex flex-col items-center justify-center gap-6">
          <H2 className="text-2xl">اسناد مستقیم</H2>
          <div className="flex flex-wrap gap-2">
            <SimpleTable data={direct_Table_Paziresh_Sabt_Avalie} />
            {/* <SimpleTable data={direct_Table_Sabt_Avalie_BedoneBime} /> */}
            <SimpleTable data={direct_Table_Hospital} />
            <SimpleTable data={direct_Table_Para_Dandan} />
            <SimpleTable data={direct_Table_Daro} />
            <SimpleTable data={direct_Table_WithoutScan} />
            <SimpleTable data={direct_Table_WithScan} />
            <div className="cross_hatch_pattern hidden w-full max-w-sm rounded-xl sm:block" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-6">
          <H2 className="text-2xl">اسناد غیر مستقیم</H2>
          <div className="flex flex-wrap gap-2">
            <SimpleTable data={indirect_Table_Hospital} />
            <SimpleTable data={inDirect_Table_Para_Dandan} />
            <SimpleTable data={inDirect_Table_Daro} />
            <SimpleTable data={inDirect_Table_WithoutScan} />
          </div>
        </div>
      </>
    </main>
  );
}
