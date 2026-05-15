-- Seed: 20 random secrets across all moods
-- Run this in the Supabase SQL Editor for project jghtqgsnevtzxhscfirg

INSERT INTO secrets (text, mood) VALUES
-- relief
('I have been pretending to be busy at work for 6 months. I read novels all day. Nobody has noticed.', 'relief'),
('I finally told my family I hate our traditional Christmas dinner. The silence was absolutely worth it.', 'relief'),

-- shame
('I cheated on a university exam and got the highest grade in class. I have never told a single person.', 'shame'),
('I ghosted my best friend after borrowing money I never paid back. She still texts me sometimes.', 'shame'),

-- pride
('I secretly trained for a year and just finished my first marathon. Nobody knew I was doing it.', 'pride'),
('I wrote an anonymous story online that went completely viral. Half a million people read it and had no idea it was me.', 'pride'),

-- regret
('I turned down my dream job to stay with someone who broke up with me exactly one month later.', 'regret'),
('I never called my dad back because I was too busy. He passed away that same evening.', 'regret'),

-- longing
('I still drive past my childhood home sometimes just hoping it looks the same. It never does.', 'longing'),
('I kept every letter she ever wrote me. It has been nine years and I still read them when it rains.', 'longing'),

-- anger
('My coworker got promoted for a project that was entirely my idea. I smiled and congratulated him.', 'anger'),
('My sister told everyone at the family dinner that I failed my driving test. I am still furious two years later.', 'anger'),

-- fear
('Every single time I fly, I write goodbye letters to everyone I love. I delete them when I land.', 'fear'),
('I am terrified that if people actually knew the real me, every single one of them would leave.', 'fear'),

-- joy
('I donate anonymously to a struggling family in my neighborhood every December. Seeing their lights go up is enough.', 'joy'),
('I secretly learned to cook gourmet food during lockdown. My friends think I am just naturally talented.', 'joy'),

-- other
('I have been talking to a complete stranger online for three years. I know more about them than my closest friends.', 'other'),
('I have a second phone that nobody in my life knows exists. It only has one contact saved in it.', 'other'),
('I convinced my entire office I speak fluent Italian. I only actually know about forty words.', 'other'),
('I pretended to be vegetarian for so long that I accidentally became one without ever making a conscious decision.', 'other');
