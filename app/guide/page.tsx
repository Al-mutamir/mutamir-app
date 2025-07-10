import Link from "next/link"
import { ArrowLeft, MapPin, BookOpen, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function QAPage() {
  const faqs = [
    {
      question: "What is the difference between Hajj and Umrah, and when is each performed?",
      answer: (
        <div className="space-y-3">
          <p>
            <strong>Hajj</strong> is a major pilgrimage that is             <em className="text-[#007F5F] font-semibold">obligatory</em> once in a lifetime for every eligible Muslim and is performed <em className="text-[#007F5F] font-semibold">only during the Islamic month of Dhul-Hijjah</em>.
          </p>
          <p>
            <strong>Umrah</strong> is a <em className="text-[#007F5F] font-semibold">non-obligatory</em> pilgrimage that can be performed <em className="text-[#007F5F] font-semibold">any time of the year</em>.
          </p>
          <p>
            Hajj includes more rituals and has specific days, while Umrah is shorter and simpler.
          </p>
        </div>
      ),
    },
    {
      question: "What are the conditions that make Hajj or Umrah obligatory upon a Muslim?",
      answer: (
        <div className="space-y-2">
          <p className="mb-3">The conditions are:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li><strong>Islam</strong> (must be Muslim)</li>
            <li><strong>Sanity</strong></li>
            <li><strong>Maturity (puberty)</strong></li>
            <li><strong>Freedom</strong></li>
            <li><strong>Physical and financial ability</strong></li>
            <li>For women: the presence of a <strong>mahram</strong> for Hajj (according to some scholars)</li>
          </ol>
        </div>
      ),
    },
    {
      question: "What is Ihram, and how does one enter into it?",
      answer: (
        <div className="space-y-3">
          <p>
            <strong>Ihram</strong> is a sacred state a pilgrim enters before performing Hajj or Umrah.
          </p>
          <div className="bg-[#F8F8F6] p-4 rounded-lg">
            <p className="mb-2">
              For <strong>men</strong>: it includes wearing two white, unstitched garments.
            </p>
            <p>
              For <strong>women</strong>: regular modest clothing (no face veil or gloves).
            </p>
          </div>
          <p>
            One enters into Ihram by making the <strong>intention (niyyah)</strong> and reciting the <strong>talbiyah</strong>:
          </p>
          <div className="bg-[#F8F8F6] p-3 rounded-lg border-l-4 border-[#E3B23C]">
            <p className="italic text-[#014034]">"Labbayk Allahumma labbayk…"</p>
          </div>
          <p>
            This must be done <em className="text-[#007F5F] font-semibold">before crossing the Miqat</em> (the designated boundary).
          </p>
        </div>
      ),
    },
    {
      question: "What are the key rites of Hajj and in what order are they performed?",
      answer: (
        <div className="space-y-2">
          <p className="mb-3">The main rites of Hajj include:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Entering <strong>Ihram</strong></li>
            <li><strong>Tawaf al-Qudum</strong> (arrival Tawaf)</li>
            <li><strong>Sa'i</strong> between Safa and Marwah</li>
            <li>Standing at <strong>Arafah</strong> on the 9th of Dhul-Hijjah</li>
            <li>Spending the night in <strong>Muzdalifah</strong></li>
            <li>Stoning the <strong>Jamarat</strong> (devil) in Mina</li>
            <li><strong>Animal sacrifice (if required)</strong></li>
            <li><strong>Tawaf al-Ifadah</strong></li>
            <li><strong>Haircut or shaving</strong></li>
            <li>Final <strong>Tawaf al-Wada'</strong> before leaving Makkah</li>
          </ol>
        </div>
      ),
    },
    {
      question: "What are the key rites of Umrah and in what order are they performed?",
      answer: (
        <div className="space-y-2">
          <p className="mb-3">The main rites of Umrah include:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Entering <strong>Ihram</strong></li>
            <li><strong>Tawaf</strong> around the Kaaba</li>
            <li><strong>Sa'i</strong> between Safa and Marwah</li>
            <li>Shaving or cutting hair</li>
              </ol>
            </div>
      ),
    },
    {
      question: "What is prohibited during Ihram?",
      answer: (
        <div className="space-y-2">
          <p className="mb-3">While in Ihram, pilgrims must avoid:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Cutting hair or nails</li>
            <li>Wearing perfume or scented products</li>
            <li>Engaging in sexual activity</li>
            <li>Hunting or killing animals</li>
            <li>Arguing or fighting</li>
            <li>Wearing stitched clothing (for men)</li>
            <li>Covering the face or hands (for women)</li>
          </ul>
        </div>
      ),
    },
    {
      question: "What should a pilgrim pack for the journey?",
      answer: (
        <div className="space-y-2">
          <p className="mb-3">Essentials include:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#F8F8F6] p-3 rounded-lg">
              <h4 className="font-semibold text-[#007F5F] mb-2">Clothing & Personal</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Ihram garments (2 sets for men)</li>
                <li>Comfortable walking shoes/sandals</li>
                <li>Travel-sized toiletries (unscented)</li>
              </ul>
            </div>
            <div className="bg-[#F8F8F6] p-3 rounded-lg">
              <h4 className="font-semibold text-[#3E7C59] mb-2">Spiritual & Practical</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Prayer mat & pocket Qur'an</li>
                <li>Water bottle, snacks, umbrella</li>
                <li>ID, health documents, money/cards</li>
              </ul>
            </div>
          </div>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-3">
            <li>Light backpack or waist pouch</li>
            <li>Medications and first-aid kit</li>
          </ul>
        </div>
      ),
    },
    {
      question: "How can a pilgrim prepare spiritually and mentally before going?",
      answer: (
        <div className="space-y-2">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Repent</strong> sincerely and settle debts</li>
            <li>Learn the rites of Hajj/Umrah properly</li>
            <li>Increase <strong>prayer, fasting, and Qur'an recitation</strong></li>
            <li>Make a list of <strong>duas and intentions</strong></li>
            <li>Seek forgiveness from others</li>
            <li>Attend Hajj training or orientation sessions</li>
            <li>Prepare for physical endurance and emotional patience</li>
          </ul>
        </div>
      ),
    },
    {
      question: "What are some key supplications to memorize for Hajj and Umrah?",
      answer: (
        <div className="space-y-4">
          <div className="bg-[#F8F8F6] p-4 rounded-lg border-l-4 border-[#E3B23C]">
            <p className="font-semibold text-[#014034] mb-2">Talbiyah:</p>
            <p className="italic text-[#3E7C59]">"Labbayk Allahumma labbayk…"</p>
          </div>
          <div className="bg-[#F8F8F6] p-4 rounded-lg border-l-4 border-[#007F5F]">
            <p className="font-semibold text-[#014034] mb-2">Dua during Tawaf:</p>
            <p className="text-sm mb-2">Any sincere dua; between the Yemeni Corner and Black Stone:</p>
            <p className="italic text-[#3E7C59]">"Rabbanaa aatina fi al-dunya hasanah…" (Qur'an 2:201)</p>
          </div>
          <div className="bg-[#F8F8F6] p-4 rounded-lg border-l-4 border-[#3E7C59]">
            <p className="font-semibold text-[#014034] mb-2">Dua on Arafah:</p>
            <p className="italic text-[#3E7C59]">"La ilaha illallah, wahdahu la sharika lah…"</p>
          </div>
          <p className="text-sm text-gray-600">
            <strong>General:</strong> Seek forgiveness, Jannah, protection from Hellfire, and good for family and the ummah.
          </p>
        </div>
      ),
    },
    {
      question: "Why do pilgrims perform Sa'i between Safa and Marwah?",
      answer: (
        <div className="space-y-3">
          <p>
            Sa'i commemorates <strong>Hajar (Hagar)</strong>, the wife of Prophet Ibrahim (AS), who ran between the hills of Safa and Marwah searching for water for her son Isma'il.
          </p>
          <div className="bg-[#F8F8F6] p-4 rounded-lg border-l-4 border-[#E3B23C]">
            <p className="text-[#014034]">
              It reflects <strong>faith, struggle, and reliance on Allah</strong>, and serves as a powerful reminder of perseverance in hardship.
            </p>
          </div>
        </div>
      ),
    },
    {
      question: "What manners and behaviors should a pilgrim uphold during the journey?",
      answer: (
        <div className="space-y-3">
          <p className="mb-3">Pilgrims should display:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Heart className="h-5 w-5 text-[#E3B23C] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Patience</p>
                  <p className="text-sm text-gray-600">and calmness despite crowds or stress</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-[#E3B23C] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Kindness and generosity</p>
                  <p className="text-sm text-gray-600">toward others</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="h-5 w-5 text-[#007F5F] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Avoiding arguments</p>
                  <p className="text-sm text-gray-600">or harsh speech</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Heart className="h-5 w-5 text-[#3E7C59] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Gratitude and humility</p>
                  <p className="text-sm text-gray-600">in worship</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-[#007F5F] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Focus on dhikr</p>
                  <p className="text-sm text-gray-600">prayer, and reflection</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#F8F8F6] p-4 rounded-lg border-l-4 border-[#007F5F] mt-4">
            <p className="text-[#014034] font-medium">
              This ensures that the spiritual benefits of the journey are maximized and accepted by Allah.
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F8F6] via-white to-[#F8F8F6]">
      {/* Header Section */}
      {/* <div className="bg-gradient-to-r from-[#007F5F] to-[#3E7C59] text-white py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Hajj & Umrah Guide
              </h1>
              <p className="text-xl text-[#F8F8F6] opacity-90 max-w-2xl">
                Essential knowledge for your spiritual journey to the holy cities of Mecca and Medina
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" size="lg" className="bg-white text-[#007F5F] hover:bg-[#F8F8F6] border-white">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Introduction Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 border-t-4 border-[#007F5F]">
          <div className="flex items-start gap-4">
            <div className="bg-[#F8F8F6] p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-[#007F5F]" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Your Complete Pilgrimage Guide
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Find comprehensive answers to essential questions about Hajj and Umrah. This guide covers everything from basic requirements to spiritual preparation, helping you make the most of your sacred journey.
              </p>
              <p className="text-gray-600 mt-4">
                Can't find what you're looking for? 
                <Link href="/contact" className="text-[#007F5F] hover:text-[#014034] font-semibold ml-1 hover:underline">
                  Contact our team
                </Link>
                {" "}for personalized guidance.
              </p>
            </div>
          </div>
        </div>

        {/* Q&A Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#007F5F] to-[#3E7C59] p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <MapPin className="h-6 w-6" />
              Questions Regarding Hajj and Umrah
            </h2>
          </div>
          
          <div className="p-6">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border rounded-lg px-6 py-2 hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-start gap-3">
                      <div className="bg-[#F8F8F6] text-[#007F5F] rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                        {index + 1}
                      </div>
                      <span className="font-semibold text-gray-800 text-lg">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 pt-4 pb-2 ml-11">
                    <div className="prose prose-sm max-w-none">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-[#007F5F] to-[#3E7C59] rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Begin Your Journey?</h3>
            <p className="text-lg mb-6 text-[#F8F8F6] opacity-90">
              Get personalized guidance and book your Hajj or Umrah package today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="bg-white text-[#007F5F] hover:bg-[#F8F8F6] font-semibold px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/standard-packages">
                <Button size="lg" variant="outline" className="bg-white text-[#007F5F] hover:bg-[#F8F8F6] font-semibold px-8">
                  View Packages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}