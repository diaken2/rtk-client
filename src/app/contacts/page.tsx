import ContactsBlock from "@/components/blocks/ContactsBlock";
 export async function generateMetadata({ params }: { params: { city: string } }) {

    return { title: `Контакты официального дилера Ростелеком` };
  }

export default function ContactsPage({cityName}:any) {
  
  return <ContactsBlock cityName={cityName}/>
} 