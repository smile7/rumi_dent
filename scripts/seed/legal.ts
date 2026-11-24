import type { LegalPage } from '../../sanity.types'
import type { Localized } from './helpers'

export type LegalKind = Exclude<NonNullable<LegalPage['kind']>, 'other'>

type LegalTemplate = { title: Localized; lines: Localized<string[]> }

/** Values that replace the `[[placeholders]]` (LEGAL-GDPR §9). */
export type LegalDetails = Record<
  'legalName' | 'uic' | 'address' | 'email' | 'phone' | 'dpo' | 'retention',
  Localized
>

/**
 * Starting texts for the legal pages, structured per LEGAL-GDPR §9. They are templates, not legal
 * advice: a lawyer/DPO reviews both languages before launch (NEW-CLIENT checklist).
 */
export const legalTemplates: Record<LegalKind, LegalTemplate> = {
  privacy: {
    title: { bg: 'Политика за поверителност', en: 'Privacy policy' },
    lines: {
      bg: [
        '## Кои сме ние',
        'Администратор на личните данни е [[legalName]], ЕИК [[uic]], с адрес [[address]]. Можете да се свържете с нас на [[email]] или на телефон [[phone]].',
        'Длъжностно лице по защита на данните: [[dpo]].',
        '## Какви данни обработваме и защо',
        '- Данни от формата за контакт (име, телефон, имейл, съобщение), за да отговорим на запитването Ви.',
        '- Технически данни (IP адрес, вид браузър), необходими за сигурността и работата на сайта.',
        '- Статистика за посещенията, описана в Политиката за бисквитките.',
        '## Правни основания',
        'Обработваме данните въз основа на Вашето искане за контакт (чл. 6, ал. 1, б. „б“ от ОРЗД), законния ни интерес да поддържаме сайта сигурен (чл. 6, ал. 1, б. „е“) и, когато е нужно, Вашето съгласие (чл. 6, ал. 1, б. „а“).',
        '## Формата за контакт',
        'Съобщенията от формата за контакт се изпращат по имейл до пощата на клиниката чрез Resend. Сайтът не ги съхранява. Моля, не изпращайте медицинска информация през формата.',
        '## Получатели и обработващи',
        'Следните доставчици обработват данни от наше име или ги получават, когато използвате съответната функция:',
        '{{processorsList}}',
        'За защитата от ботове Cloudflare обработва данни от наше име. Когато използва същите технически сигнали, за да подобрява услугата Turnstile, Cloudflare е самостоятелен администратор на данни.',
        '## Предаване извън ЕС',
        'Някои доставчици могат да обработват данни извън Европейския съюз. В тези случаи предаването се извършва въз основа на стандартни договорни клаузи или решение на Европейската комисия за адекватност.',
        '## Срокове за съхранение',
        'Запитванията от формата пазим до [[retention]], освен ако не станете наш пациент. Медицинската документация се съхранява според сроковете в здравното законодателство.',
        '## Вашите права',
        'Имате право на достъп, коригиране, изтриване, ограничаване, преносимост и възражение, както и да оттеглите съгласието си по всяко време. Можете да подадете жалба до Комисията за защита на личните данни (КЗЛД), бул. „Проф. Цветан Лазаров“ № 2, София 1592, www.cpdp.bg.',
        '## Деца',
        'Ако запитването е за дете, нека го изпрати родител или настойник. Деца под 14 години не бива да изпращат формата сами. Данни на деца обработваме само със съгласието на родител или настойник.',
        '## Сигурност',
        'Използваме криптирана връзка (TLS), ограничен достъп и събираме само необходимите данни.',
        '## Бисквитки',
        'Подробности ще намерите в Политиката за бисквитките.',
        '## Промени',
        'Можем да актуализираме тази политика. Датата на последната промяна е посочена на страницата.',
      ],
      en: [
        '## Who we are',
        'The data controller is [[legalName]], UIC [[uic]], [[address]]. You can reach us at [[email]] or by phone on [[phone]].',
        'Data protection officer: [[dpo]].',
        '## What data we process and why',
        '- Contact form data (name, phone, email, message), to answer your enquiry.',
        '- Technical data (IP address, browser type), needed to keep the site secure and working.',
        '- Visit statistics, as described in the cookie policy.',
        '## Legal bases',
        'We process data because you asked us to contact you (Art. 6(1)(b) GDPR), for our legitimate interest in a secure website (Art. 6(1)(f)) and, where needed, with your consent (Art. 6(1)(a)).',
        '## The contact form',
        "Messages from the contact form are sent by email to the clinic's mailbox through Resend. The website doesn't store them. Please don't send medical details through the form.",
        '## Recipients and processors',
        'These providers process data on our behalf, or receive it when you use the feature concerned:',
        '{{processorsList}}',
        'For bot protection, Cloudflare processes data on our behalf. When it uses the same technical signals to improve its Turnstile service, Cloudflare is an independent controller.',
        '## Transfers outside the EU',
        'Some providers may process data outside the European Union. Such transfers rely on standard contractual clauses or a European Commission adequacy decision.',
        '## How long we keep data',
        'We keep form enquiries for up to [[retention]] unless you become a patient. Medical records are kept for the periods set by health legislation.',
        '## Your rights',
        'You have the right to access, rectify, erase, restrict and port your data, to object, and to withdraw consent at any time. You can complain to the Commission for Personal Data Protection (CPDP), 2 Prof. Tsvetan Lazarov Blvd., Sofia 1592, www.cpdp.bg.',
        '## Children',
        "If the enquiry is about a child, a parent or guardian should send it. Children under 14 shouldn't send the form themselves. We only process children's data with the consent of a parent or guardian.",
        '## Security',
        'We use an encrypted connection (TLS), limit access and collect only the data we need.',
        '## Cookies',
        'See the cookie policy for details.',
        '## Changes',
        'We may update this policy. The date of the last change is shown on this page.',
      ],
    },
  },
  cookies: {
    title: { bg: 'Политика за бисквитките', en: 'Cookie policy' },
    lines: {
      bg: [
        '## Какво са бисквитките',
        'Бисквитките и локалното хранилище са малки файлове, които сайтът записва в браузъра Ви, за да работи правилно или да запомни избора Ви.',
        '## Какво използваме',
        'Таблицата по-долу показва всяка бисквитка и всеки запис, който сайтът използва: име, доставчик, цел, срок и категория.',
        '{{cookieTable}}',
        '## Как да промените избора си',
        'Можете да промените съгласието си по всяко време чрез бутона „Настройки на бисквитките“ в долната част на сайта. Можете също да изтриете бисквитките от настройките на браузъра си.',
        'Въпроси: [[email]].',
      ],
      en: [
        '## What cookies are',
        'Cookies and local storage are small files the site saves in your browser so it works properly or remembers your choices.',
        '## What we use',
        'The table below lists every cookie and storage item the site uses: name, provider, purpose, duration and category.',
        '{{cookieTable}}',
        '## Changing your choice',
        'You can change your consent at any time with the "Cookie settings" button at the bottom of the site. You can also delete cookies in your browser settings.',
        'Questions: [[email]].',
      ],
    },
  },
  gdpr: {
    title: { bg: 'Вашите права (GDPR)', en: 'Your data rights' },
    lines: {
      bg: [
        '## Как да упражните правата си',
        'Изпратете ни искане на [[email]], по пощата на [[address]] или го подайте лично в клиниката.',
        '## Проверка на самоличността',
        'Преди да отговорим, може да поискаме да потвърдите самоличността си, за да не разкрием данни на друг човек.',
        '## Срок за отговор',
        'Отговаряме до един месец. При сложни искания срокът може да бъде удължен с още два месеца, като ще Ви уведомим за това.',
        '## Цена',
        'Упражняването на правата Ви по принцип е безплатно.',
        '## Медицинска документация',
        'Медицинската документация на пациентите се води и съхранява според здравното законодателство, а не чрез процесите на този сайт.',
        '## Примерно искане',
        '„Моля, предоставете ми копие от личните данни, които обработвате за мен. Име: …, телефон: …“',
      ],
      en: [
        '## How to exercise your rights',
        'Send your request to [[email]], by post to [[address]], or hand it in at the clinic.',
        '## Identity check',
        'Before we answer, we may ask you to confirm your identity so we never disclose data to someone else.',
        '## Response time',
        'We answer within one month. For complex requests this can be extended by two more months, and we will tell you if it is.',
        '## Cost',
        'Exercising your rights is free of charge in principle.',
        '## Medical records',
        "Patients' medical records are kept under health legislation, not through this website's processes.",
        '## Sample request',
        '"Please send me a copy of the personal data you process about me. Name: …, phone: …"',
      ],
    },
  },
  terms: {
    title: { bg: 'Общи условия за ползване', en: 'Terms of use' },
    lines: {
      bg: [
        '## Доставчик',
        '[[legalName]], ЕИК [[uic]], [[address]], [[email]], [[phone]].',
        '## Цел на сайта',
        'Сайтът дава обща информация за клиниката и услугите ѝ. Той не заменя консултация и преглед от лекар по дентална медицина.',
        '## Авторски права',
        'Текстовете и снимките на сайта принадлежат на [[legalName]] или се използват с разрешение. Не ги копирайте без писмено съгласие.',
        '## Връзки към други сайтове',
        'Не отговаряме за съдържанието на външни сайтове, към които водят връзки от нашия.',
        '## Отговорност',
        'Полагаме грижа информацията да е вярна и актуална, но не носим отговорност за решения, взети само въз основа на нея.',
        '## Приложимо право',
        'Прилага се българското право. Споровете се решават от компетентния български съд.',
        '## Промени',
        'Можем да променяме тези условия. Датата на последната промяна е посочена на страницата.',
      ],
      en: [
        '## Provider',
        '[[legalName]], UIC [[uic]], [[address]], [[email]], [[phone]].',
        '## Purpose of the site',
        'The site gives general information about the clinic and its services. It does not replace a consultation or examination by a dentist.',
        '## Copyright',
        'The texts and photos on this site belong to [[legalName]] or are used with permission. Please do not copy them without written consent.',
        '## Links to other sites',
        'We are not responsible for the content of external sites linked from ours.',
        '## Liability',
        'We take care to keep the information accurate and current, but we are not liable for decisions based on it alone.',
        '## Applicable law',
        'Bulgarian law applies. Disputes are settled by the competent Bulgarian court.',
        '## Changes',
        'We may change these terms. The date of the last change is shown on this page.',
      ],
    },
  },
}

/** Replaces every `[[key]]` found in `details`; unknown placeholders stay, so publishing stays blocked. */
export const fillPlaceholders = (line: string, details: Record<string, string>): string =>
  line.replace(/\[\[([^\]]+)\]\]/g, (placeholder, key: string) => details[key] ?? placeholder)
