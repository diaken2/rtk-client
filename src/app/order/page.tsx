import OrderBlock from "@/components/blocks/OrderBlock";
  export async function generateMetadata({ params }: { params: { city: string } }) {
 

  return { title: `Заявка на подключение к Ростелеком — подать заявку онлайн в Ростелеком.` };
}
export default function OrderPage() {


  
        return <OrderBlock/>
} 