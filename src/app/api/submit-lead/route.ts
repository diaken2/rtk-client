import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = '7732656798:AAEtzvGJcCcCXHH7UH_b0quwJdhpCWb-zN8';
const TELEGRAM_CHAT_ID = '973416651';

interface LeadData {
  type: string;
  name?: string;
  phone: string;
  address?: string;
  comment?: string;
  houseType?: string;
  callTime?: string;
  category?: string;
  supportValue?: string;
  otherValue?: string;
}

async function sendTelegramMessage(message: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

function formatLeadMessage(data: LeadData): string {
  const timestamp = new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `🚨 <b>НОВАЯ ЗАЯВКА</b>\n\n`;
  message += `📅 <b>Дата:</b> ${timestamp}\n`;
  message += `📋 <b>Тип:</b> ${data.type}\n\n`;

  if (data.name) {
    message += `👤 <b>Имя:</b> ${data.name}\n`;
  }

  message += `📞 <b>Телефон:</b> ${data.phone}\n`;

  if (data.address) {
    message += `🏠 <b>Адрес:</b> ${data.address}\n`;
  }

  if (data.houseType) {
    message += `🏘️ <b>Тип жилья:</b> ${data.houseType}\n`;
  }

  if (data.callTime) {
    message += `⏰ <b>Время звонка:</b> ${data.callTime}\n`;
  }

  if (data.category) {
    message += `📂 <b>Категория:</b> ${data.category}\n`;
  }

  if (data.supportValue) {
    message += `🔧 <b>Проблема:</b> ${data.supportValue}\n`;
  }

  if (data.otherValue) {
    message += `📝 <b>Дополнительно:</b> ${data.otherValue}\n`;
  }

  if (data.comment) {
    message += `💬 <b>Комментарий:</b> ${data.comment}\n`;
  }

  message += `\n🔗 <b>Источник:</b> rostelecom-tariffs.ru`;

  return message;
}

export async function POST(request: NextRequest) {
  try {
    const data: LeadData = await request.json();

    // Валидация обязательных полей
    if (!data.phone || !data.type) {
      return NextResponse.json(
        { error: 'Missing required fields: phone, type' },
        { status: 400 }
      );
    }

    // Форматируем сообщение для Telegram
    const message = formatLeadMessage(data);

    // Отправляем в Telegram
    await sendTelegramMessage(message);

    return NextResponse.json({ success: true, message: 'Lead submitted successfully' });
  } catch (error) {
    console.error('Error submitting lead:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    );
  }
} 