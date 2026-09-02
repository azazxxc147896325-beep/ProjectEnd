import { PrismaClient, Role, OrderType, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Comprehensive Campus Food Seeding (8 Diverse Vendors)...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Define Vendors with their Owner Accounts and Complete Menus
  const vendorsData = [
    {
      ownerEmail: 'vendor.somjai@campus.ac.th',
      ownerName: 'ป้าสมใจ (Somjai)',
      phone: '081-234-5678',
      vendor: {
        name: 'ครัวป้าสมใจ (Somjai Kitchen)',
        description: 'อาหารตามสั่งและกะเพรากระทะร้อน รสจัดจ้าน วัตถุดิบสดใหม่ ให้เยอะ อิ่มคุ้ม',
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
        isOpen: true,
      },
      menu: [
        {
          name: 'กะเพราหมูกรอบไข่ดาว',
          description: 'หมูกรอบคั่วพริกแห้งใบกะเพราป่าแท้ พร้อมไข่ดาวกรอบไข่แดงเยิ้ม',
          price: 65,
          category: 'อาหารจานเดียว',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
        },
        {
          name: 'ข้าวผัดต้มยำทะเลรวม',
          description: 'ข้าวผัดหอมกลิ่นสมุนไพรต้มยำ กุ้งสด หมึกสด เครื่องแน่น',
          price: 65,
          category: 'อาหารจานเดียว',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600',
        },
        {
          name: 'ข้าวไข่ข้นกุ้งสดกระเทียม',
          description: 'ไข่ข้นเนื้อนุ่มละมุน โรยกุ้งสดผัดพริกไทยดำหอมเตาถ่าน',
          price: 60,
          category: 'อาหารจานเดียว',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        },
        {
          name: 'ต้มยำกุ้งแม่น้ำน้ำข้น',
          description: 'ต้มยำสูตรโบราณ มะนาวคั้นสด พริกเผาเข้มข้น มันกุ้งเยิ้ม',
          price: 80,
          category: 'ต้ม/แกง',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
        },
        {
          name: 'ชาไทยเย็นนมสดโบราณ',
          description: 'ใบชาคัดพิเศษ หอมมันกลมกล่อม หวานกำลังดี',
          price: 30,
          category: 'เครื่องดื่ม',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600',
        },
      ],
    },
    {
      ownerEmail: 'vendor.boatnoodle@campus.ac.th',
      ownerName: 'โกเบิ้ม อยุธยา',
      phone: '082-345-6789',
      vendor: {
        name: 'เตี๋ยวเรืออยุธยา สูตรเด็ดหลังมอ',
        description: 'ก๋วยเตี๋ยวเรือน้ำตกเข้มข้นสูตรโบราณ หมูตุ๋น เนื้อตุ๋นเปื่อยละลายในปาก',
        logoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
        isOpen: true,
      },
      menu: [
        {
          name: 'ก๋วยเตี๋ยวเรือหมูตุ๋นน้ำตกพิเศษ',
          description: 'เส้นเล็กเหนียวนุ่ม หมูตุ๋นยาจีน ตับลวกนุ่ม น้ำตกสูตรเข้มข้น',
          price: 55,
          category: 'ก๋วยเตี๋ยว',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
        },
        {
          name: 'ก๋วยเตี๋ยวเนื้อเปื่อยริบอายน้ำตก',
          description: 'เนื้อเปื่อยคัดพิเศษ ตุ๋นเครื่องเทศนานกว่า 6 ชั่วโมง หอมละมุน',
          price: 70,
          category: 'ก๋วยเตี๋ยว',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
        },
        {
          name: 'บะหมี่ต้มยำหมูมะนาวไข่ยางมะตูม',
          description: 'บะหมี่ไข่เส้นแบน ต้มยำถั่วคั่วเอง มะนาวแท้ ไข่ยางมะตูมเยิ้ม',
          price: 60,
          category: 'ก๋วยเตี๋ยว',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600',
        },
        {
          name: 'ลวกจิ้มรวมมิตรหมูน้ำจิ้มแจ่ว',
          description: 'หมูหมัก ลูกชิ้น ตับ ลวกสะดุ้ง เสิร์ฟพร้อมน้ำจิ้มแจ่วรสเด็ด',
          price: 65,
          category: 'ทานเล่น',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        },
        {
          name: 'กากหมูกระจกกรอบโรยกระเทียม',
          description: 'กากหมูเจียวสดใหม่ทุกเช้า กรอบไม่อมน้ำมัน ทานคู่ก๋วยเตี๋ยวฟินสุดๆ',
          price: 20,
          category: 'ทานเล่น',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
        },
      ],
    },
    {
      ownerEmail: 'vendor.chickenrice@campus.ac.th',
      ownerName: 'เฮียชัย ข้าวมันไก่',
      phone: '083-456-7890',
      vendor: {
        name: 'ข้าวมันไก่เฮียชัย ตอนเมือง',
        description: 'ข้าวมันไก่ตอนเนื้อฉ่ำ ข้าวมันหอมเมล็ดสวย น้ำจิ้มเต้าเจี้ยวสูตรเด็ดเยาวราช',
        logoUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600',
        isOpen: true,
      },
      menu: [
        {
          name: 'ข้าวมันไก่ตอนเนื้อน่องพิเศษ',
          description: 'ไก่ตอนเนื้อนุ่มชุ่มฉ่ำ หนังบาง ข้าวมันหอมกระเทียมและขิง',
          price: 55,
          category: 'อาหารจานเดียว',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600',
        },
        {
          name: 'ข้าวมันไก่ทอดกรอบไม่อมน้ำมัน',
          description: 'สะโพกไก่หมักเครื่องเทศ ชุบเกล็ดขนมปังทอดสีทองกรอบนอกนุ่มใน',
          price: 55,
          category: 'อาหารจานเดียว',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600',
        },
        {
          name: 'ข้าวมันไก่ผสม (ต้ม + ทอด)',
          description: 'อิ่มจุใจแบบทูอินวัน ได้ทั้งไก่ตอนเนื้อนุ่มและไก่ทอดกรอบ',
          price: 65,
          category: 'อาหารจานเดียว',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600',
        },
        {
          name: 'ซุปต้มฟักมะนาวดองโครงไก่',
          description: 'น้ำซุปเคี่ยวนาน รสเปรี้ยวกลมกล่อม ซดคล่องคอแก้ง่วง',
          price: 25,
          category: 'ต้ม/แกง',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        },
      ],
    },
    {
      ownerEmail: 'vendor.somtam@campus.ac.th',
      ownerName: 'น้องดาว อีสานแซ่บ',
      phone: '084-567-8901',
      vendor: {
        name: 'ส้มตำแซ่บอีสาน น้องดาว',
        description: 'ส้มตำ ลาบ น้ำตก ไก่ย่างเตาถ่าน ปลาร้าต้มสุกกลิ่นหอมนัว สะอาดถูกหลักอนามัย',
        logoUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600',
        isOpen: true,
      },
      menu: [
        {
          name: 'ส้มตำปูปลาร้าแซ่บนัว',
          description: 'เส้นมะละกอกรอบ ตำพริกสด ปลาร้านัวสูตรเฉพาะ โรยเม็ดกระถิน',
          price: 45,
          category: 'ส้มตำ/ยำ',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600',
        },
        {
          name: 'ส้มตำไทยไข่เค็ม',
          description: 'ตำไทยรสกลมกล่อม เปรี้ยวหวานกำลังดี ไข่เค็มไชยาเต็มฟอง',
          price: 50,
          category: 'ส้มตำ/ยำ',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600',
        },
        {
          name: 'คอหมูย่างฉ่ำเตาถ่าน',
          description: 'คอหมูแท้หมักน้ำผึ้งและพริกไทย ย่างเตาถ่านหอมกรุ่น เสิร์ฟพร้อมน้ำจิ้มแจ่ว',
          price: 75,
          category: 'ย่าง/ทอด',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
        },
        {
          name: 'ต้มแซ่บกระดูกหมูอ่อน',
          description: 'กระดูกอ่อนเคี่ยวเปื่อยนุ่ม น้ำซุปต้มแซ่บรสจัดจ้าน โรยข้าวคั่วใบกะเพรา',
          price: 70,
          category: 'ต้ม/แกง',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
        },
        {
          name: 'ข้าวเหนียวเขี้ยวงูนึ่งนุ่ม',
          description: 'ข้าวเหนียวใหม่นึ่งร้อนๆ หอมนุ่มเม็ดสวย ไม่แฉะ',
          price: 15,
          category: 'อาหารจานเดียว',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600',
        },
      ],
    },
    {
      ownerEmail: 'vendor.steak@campus.ac.th',
      ownerName: 'เชฟท็อป สเต็ก',
      phone: '085-678-9012',
      vendor: {
        name: 'สเต็กเด็กหอ & เบอร์เกอร์ชีส',
        description: 'สเต็กกระทะร้อน สปาเก็ตตี้ และเบอร์เกอร์เนื้อฉ่ำ ชีสเยิ้ม ราคานักศึกษา',
        logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
        isOpen: true,
      },
      menu: [
        {
          name: 'สเต็กหมูพริกไทยดำพร้อมเฟรนช์ฟรายส์',
          description: 'สันนอกหมูหมักนุ่ม ย่างสุกกำลังดี ราดซอสพริกไทยดำเข้มข้น สลัดและมันฝรั่งทอด',
          price: 89,
          category: 'สเต็ก',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
        },
        {
          name: 'สปาเก็ตตี้คาโบนาร่าเบคอนกรอบ',
          description: 'เส้นสปาเก็ตตี้คลุกซอสครีมชีสพาร์มีซานแท้ เบคอนทอดกรอบ',
          price: 75,
          category: 'พาสต้า',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281290?w=600',
        },
        {
          name: 'ดับเบิ้ลชีสเบอร์เกอร์เนื้อฉ่ำ',
          description: 'เนื้อเบอร์เกอร์โฮมเมดย่างฉ่ำ 2 ชั้น เชดด้าชีสเยิ้ม ซอสการ์ลิกมาโย',
          price: 99,
          category: 'เบอร์เกอร์',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
        },
        {
          name: 'มันฝรั่งทอดคลุกผงชีสสไปซี่',
          description: 'เฟรนช์ฟรายส์ทอดร้อนๆ กรอบนาน คลุกผงปรุงรสชีสและพริกปาปริก้า',
          price: 45,
          category: 'ทานเล่น',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
        },
      ],
    },
    {
      ownerEmail: 'vendor.healthy@campus.ac.th',
      ownerName: 'โค้ชแนน เฮลตี้',
      phone: '086-789-0123',
      vendor: {
        name: 'Green Box Clean Food & Salad',
        description: 'อาหารคลีน สลัดผักออร์แกนิก ข้าวไรซ์เบอร์รี่ แคลอรีต่ำ โปรตีนสูงเพื่อสายสุขภาพ',
        logoUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
        isOpen: true,
      },
      menu: [
        {
          name: 'ข้าวไรซ์เบอร์รี่อกไก่นุ่มพริกไทยดำ',
          description: 'อกไก่หมักนุ่มไม่แห้งกร้าน ย่างไร้น้ำมัน ผักนึ่งบรอกโคลีและแครอท (350 kcal)',
          price: 69,
          category: 'อาหารคลีน',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        },
        {
          name: 'สลัดโรลอกไก่ไข่ต้มน้ำสลัดงาญี่ปุ่น',
          description: 'ผักสลัดไฮโดรโปนิกส์ม้วนสดใหม่ ทานคู่น้ำสลัดงาคั่วญี่ปุ่นหอมมัน',
          price: 55,
          category: 'สลัด',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
        },
        {
          name: 'ข้าวแซลมอนย่างซีอิ๊วเทอริยากิ',
          description: 'ปลาแซลมอนนอร์เวย์ย่างซอสเทอริยากิ โรยงาขาว ข้าวไรซ์เบอร์รี่ร้อนๆ',
          price: 99,
          category: 'อาหารคลีน',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        },
        {
          name: 'กรีกโยเกิร์ตโบลว์ผลไม้สดและกราโนล่า',
          description: 'กรีกโยเกิร์ตเข้มข้น โปะบลูเบอร์รี สตรอว์เบอร์รี และกราโนล่าอบกรอบ',
          price: 65,
          category: 'ของหวานเพื่อสุขภาพ',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600',
        },
      ],
    },
    {
      ownerEmail: 'vendor.cafe@campus.ac.th',
      ownerName: 'บาริสต้าปอนด์',
      phone: '087-890-1234',
      vendor: {
        name: 'Sweet Time Cafe & Bubble Tea',
        description: 'ชานมไข่มุกไต้หวัน กาแฟสดคั่วบดหอมกรุ่น ครอฟเฟิลเนยสดแท้ อบใหม่ทุกออเดอร์',
        logoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600',
        isOpen: true,
      },
      menu: [
        {
          name: 'ชานมไต้หวันบราวชูการ์ไข่มุกลาวา',
          description: 'ชานมเข้มข้นสูตรต้นตำรับ เคี่ยวน้ำตาลทรายแดง ไข่มุกต้มสดหนุบหนับ',
          price: 45,
          category: 'เครื่องดื่ม',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600',
        },
        {
          name: 'มัทฉะลาเต้แท้เข้มข้นจากอุจิ',
          description: 'ผงมัทฉะเกรดพรีเมียมจากญี่ปุ่น ชงสดแก้วต่อแก้ว นมสดแท้ 100%',
          price: 55,
          category: 'เครื่องดื่ม',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600',
        },
        {
          name: 'อเมริกาโน่เย็นเมล็ดดอยช้างคั่วกลาง',
          description: 'กาแฟอาราบิก้าแท้ สกัดช็อตสด หอมกลิ่นช็อกโกแลตและคาราเมล',
          price: 45,
          category: 'กาแฟ',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600',
        },
        {
          name: 'ครอฟเฟิลเนยสดคาราเมลอัลมอนด์',
          description: 'แป้งครัวซองต์ฝรั่งเศส นำมากดในเตาวาฟเฟิล กรอบนอกนุ่มฉ่ำเนยสด',
          price: 50,
          category: 'ของหวาน/เบเกอรี่',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
        },
      ],
    },
    {
      ownerEmail: 'vendor.southern@campus.ac.th',
      ownerName: 'ป้าเรณู ข้าวแกงใต้',
      phone: '088-901-2345',
      vendor: {
        name: 'ข้าวแกงปักษ์ใต้ คุณนายเรณู',
        description: 'ข้าวราดแกงใต้แท้ๆ พริกแกงตำเอง รสชาติจัดจ้านถึงใจ ผักเหนาะและน้ำพริกกะปิฟรี',
        logoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        isOpen: true,
      },
      menu: [
        {
          name: 'ข้าวราดคั่วกลิ้งหมูสับ + ไข่ต้มยางมะตูม',
          description: 'คั่วกลิ้งแห้งหอมสมุนไพร พริกไทยอ่อน ใบมะกรูดซอย เผ็ดร้อนกำลังดี',
          price: 50,
          category: 'อาหารจานเดียว',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        },
        {
          name: 'ข้าวราดแกงส้มปลากะพงยอดมะพร้าวอ่อน',
          description: 'แกงเหลืองใต้แท้ ปลากะพงชิ้นโต ยอดมะพร้าวกรุบกรอบ รสเปรี้ยวเผ็ดแซ่บ',
          price: 55,
          category: 'อาหารจานเดียว',
          isDailySpecial: true,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
        },
        {
          name: 'ข้าวราดหมูหวาน + แกงไตปลาข้น',
          description: 'หมูสามชั้นเคี่ยวหวานฉ่ำ ตัดรสกับแกงไตปลาแห้งรสเข้มข้น',
          price: 55,
          category: 'อาหารจานเดียว',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600',
        },
        {
          name: 'ต้มจืดเต้าหู้หมูสับสาหร่าย',
          description: 'ซุปกระดูกหมูใส เต้าหู้ไข่ หมูสับก้อน ซดแก้เผ็ดได้ดีเยี่ยม',
          price: 35,
          category: 'ต้ม/แกง',
          isDailySpecial: false,
          isAvailable: true,
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
        },
      ],
    },
  ];

  // 2. Loop and upsert all vendors and menu items
  let totalMenusCreated = 0;
  for (const v of vendorsData) {
    const user = await prisma.user.upsert({
      where: { email: v.ownerEmail },
      update: {
        fullName: v.ownerName,
        phone: v.phone,
      },
      create: {
        email: v.ownerEmail,
        password: passwordHash,
        fullName: v.ownerName,
        role: Role.vendor,
        phone: v.phone,
      },
    });

    let vendor = await prisma.vendor.findUnique({
      where: { ownerId: user.id },
    });

    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          ownerId: user.id,
          name: v.vendor.name,
          description: v.vendor.description,
          logoUrl: v.vendor.logoUrl,
          promptpayId: v.phone.replace(/[^0-9]/g, ''),
          isOpen: v.vendor.isOpen,
        },
      });
    } else {
      vendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          name: v.vendor.name,
          description: v.vendor.description,
          logoUrl: v.vendor.logoUrl,
          promptpayId: v.phone.replace(/[^0-9]/g, ''),
          isOpen: v.vendor.isOpen,
        },
      });
    }

    console.log(`✅ [Vendor Ready]: ${vendor.name} (${vendor.id})`);

    // Create / Upsert Menu Items for this vendor
    for (const item of v.menu) {
      const existingMenu = await prisma.menuItem.findFirst({
        where: { vendorId: vendor.id, name: item.name },
      });

      if (!existingMenu) {
        await prisma.menuItem.create({
          data: {
            ...item,
            vendorId: vendor.id,
          },
        });
        totalMenusCreated++;
      } else {
        await prisma.menuItem.update({
          where: { id: existingMenu.id },
          data: {
            ...item,
          },
        });
      }
    }
  }

  console.log(`\n🎉 Successfully Seeded 8 Vendors and ${totalMenusCreated} Menu Items into PostgreSQL Database!`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
