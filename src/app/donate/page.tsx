import Link from "next/link";
import Image from "next/image";

const USES = [
  {
    icon: "⚽",
    title: "Equipment & Gear",
    description:
      "Balls, cones, pinnies, goals, and training aids that keep every practice running at full speed.",
  },
  {
    icon: "🚌",
    title: "Travel & Tournament Fees",
    description:
      "Transportation, lodging, and entry fees for away games and regional club tournaments.",
  },
  {
    icon: "👕",
    title: "Uniforms & Kit",
    description:
      "Matching kits keep us looking sharp and help build the team identity on and off the field.",
  },
  {
    icon: "🎉",
    title: "Team Events & Culture",
    description:
      "End-of-season banquets, team-building outings, and social events that strengthen our community.",
  },
  {
    icon: "📋",
    title: "Field Reservations",
    description:
      "Securing dedicated practice time on quality fields so we can train consistently throughout the season.",
  },
  {
    icon: "🏥",
    title: "First Aid & Safety",
    description:
      "Medical supplies, ice, and safety equipment to keep every player healthy and protected.",
  },
];

export default function DonatePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="/backgroungImage1.JPG"
          alt="Carleton Club Soccer team"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-carleton-blue/80" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-carleton-maize mb-3">
            Carleton Club Soccer
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Support the Team You Love
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            Every dollar you give goes directly toward giving our players the
            resources they need to compete, grow, and build lasting friendships.
          </p>
          <a
            href="https://give.carleton.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-carleton-maize text-carleton-blue font-bold px-8 py-4 rounded-full text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            Donate Now →
          </a>
        </div>
      </section>

      {/* About the Fund */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            About the Endowment Fund
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
            Carleton Club Soccer is an entirely student-run organization. We
            receive no varsity budget — every piece of equipment, every away
            trip, and every team dinner is made possible through member dues and
            the generosity of alumni, parents, and friends like you.
          </p>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto mt-4">
            Contributions to our endowment fund are pooled and managed by the
            club treasurer under Carleton&apos;s student organization financial
            guidelines, ensuring your gift is used responsibly and transparently.
          </p>
        </div>

        {/* How funds are used */}
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Where Your Money Goes
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {USES.map(({ icon, title, description }) => (
            <div
              key={title}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-3xl mb-3 block">{icon}</span>
              <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact banner */}
      <section className="bg-carleton-blue text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Every Contribution Counts</h2>
          <p className="text-white/75 max-w-xl mx-auto mb-8">
            No gift is too small. Whether you give $10 or $1,000, you are
            directly investing in the experience of Carleton students who share
            a passion for the beautiful game.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10 text-center">
            {[
              { amount: "$25", impact: "covers a match ball for a full practice" },
              { amount: "$100", impact: "helps fund travel to a regional tournament" },
              { amount: "$250", impact: "sponsors a full kit for one player" },
            ].map(({ amount, impact }) => (
              <div key={amount} className="bg-white/10 rounded-2xl px-6 py-5">
                <p className="text-3xl font-extrabold text-carleton-maize mb-1">{amount}</p>
                <p className="text-sm text-white/80">{impact}</p>
              </div>
            ))}
          </div>
          <a
            href="https://give.carleton.edu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-carleton-maize text-carleton-blue font-bold px-8 py-4 rounded-full text-base hover:opacity-90 transition-opacity"
          >
            Make a Gift →
          </a>
        </div>
      </section>

      {/* Questions */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Questions?</h2>
        <p className="text-gray-500 mb-4">
          Reach out to our club treasurer or visit the contact page and we will
          get back to you as soon as possible.
        </p>
        <Link
          href="/contact"
          className="inline-block border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Contact Us
        </Link>
      </section>
    </div>
  );
}
