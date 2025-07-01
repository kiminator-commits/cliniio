import React, { useEffect, useState } from 'react';

const funGreetings = [
  'Welcome back, sterilization superstar! ✨',
  'Hey there, inventory rockstar! 🎸',
  "The clinic's MVP is back in action! 🏆",
  'Welcome to another day of medical excellence! 🌟',
  'Ready to tackle some sterilization challenges? 💪',
  'Back in the clinic and ready to shine! ✨',
  'Time to make those tools gleam! ✨',
  'Welcome back! The tools missed you! 🔧',
  "Let's make today spotlessly successful! ✨",
  'Ready to master the medical inventory? 📋',
  'The sterilization superstar has arrived! 🌟',
  "Let's make those tools SHINE today! ✨",
  'Welcome back to your sterilization kingdom! 👑',
  "Ready to conquer today's challenge? Let's do this! 🏅",
  'Another day, another challenge to crush! 🚀',
  "Your daily challenge awaits—show it who's boss! 💪",
  'Inventory hero reporting for duty! 📦',
  "Let's keep those supplies in tip-top shape! 🗂️",
  'Inventory wizardry in progress—abracadabra! 🧙‍♂️',
  'Time to check off those tasks like a pro! ✅',
  'Taskmaster mode: activated! 🕹️',
  "Let's make that to-do list disappear! ✨",
  'Sparkle squad, assemble! 🧽',
  "Let's make every room shine bright! 💡",
  'Clean team, ready for action! 🦸‍♀️',
  'Knowledge quest begins now! 📚',
  'Time to level up your skills! 🎮',
  'Learning legend in the house! 🏆',
];

const Greeting: React.FC = () => {
  const [greeting, setGreeting] = useState(funGreetings[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * funGreetings.length);
    setGreeting(funGreetings[randomIndex]);
  }, []);

  return <h1 className="text-xl md:text-2xl font-bold text-[#5b5b5b] mb-2">{greeting}</h1>;
};

export default Greeting;
