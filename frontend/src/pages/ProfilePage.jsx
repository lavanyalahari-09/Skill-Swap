import { useEffect, useState } from 'react';
import SkillPill from '../components/SkillPill.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api.js';

const emptySkill = { skillName: '', description: '', type: 'teach', level: 'Intermediate' };

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user.name,
    bio: user.bio || '',
    location: user.location || '',
    availability: user.availability || '',
    interests: user.interests?.join(', ') || '',
    avatarColor: user.avatarColor || '#0f766e'
  });
  const [skillForm, setSkillForm] = useState(emptySkill);
  const [skills, setSkills] = useState([]);
  const [notice, setNotice] = useState('');

  const loadSkills = async () => {
    const { data } = await api.get('/skills');
    setSkills(data);
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    const payload = {
      ...profile,
      interests: profile.interests.split(',').map((item) => item.trim()).filter(Boolean)
    };
    const { data } = await api.put('/users/me', payload);
    updateUser(data);
    setNotice('Profile updated successfully');
  };

  const addSkill = async (event) => {
    event.preventDefault();
    await api.post('/skills', skillForm);
    setSkillForm(emptySkill);
    setNotice('Skill added successfully');
    loadSkills();
  };

  const deleteSkill = async (id) => {
    await api.delete(`/skills/${id}`);
    loadSkills();
  };

  const teachSkills = skills.filter((skill) => skill.type === 'teach');
  const learnSkills = skills.filter((skill) => skill.type === 'learn');

  return (
    <div className="space-y-6">
      <section className="premium-card rounded-2xl p-6">
        <div className="relative grid gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="eyebrow text-lagoon">Profile studio</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold md:text-5xl">Shape how other learners discover you.</h2>
            <p className="mt-3 max-w-2xl text-ink/65">
              A complete profile and balanced teach/learn skills make your account more matchable.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-teal-50 p-4">
              <p className="text-sm font-bold text-ink/55">Offered</p>
              <p className="font-display text-4xl font-extrabold text-lagoon">{teachSkills.length}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-sm font-bold text-ink/55">Wanted</p>
              <p className="font-display text-4xl font-extrabold text-mango">{learnSkills.length}</p>
            </div>
          </div>
        </div>
      </section>

    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form onSubmit={saveProfile} className="panel rounded-2xl p-6">
        <p className="eyebrow text-lagoon">Profile</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold">Tell learners about you</h2>
        <p className="mt-2 text-ink/60">A clear profile helps other students trust your skill exchange request.</p>

        <div className="mt-6 grid gap-4">
          {[
            ['name', 'Name'],
            ['location', 'Location'],
            ['availability', 'Availability']
          ].map(([key, label]) => (
            <label key={key}>
              <span className="font-bold">{label}</span>
              <input
                className="field mt-2"
                value={profile[key]}
                onChange={(event) => setProfile({ ...profile, [key]: event.target.value })}
              />
            </label>
          ))}
          <label>
            <span className="font-bold">Bio</span>
            <textarea
              rows="4"
              className="field mt-2"
              value={profile.bio}
              onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
            />
          </label>
          <label>
            <span className="font-bold">Interests comma separated</span>
            <input
              className="field mt-2"
              value={profile.interests}
              onChange={(event) => setProfile({ ...profile, interests: event.target.value })}
            />
          </label>
          <button className="btn-primary">Save profile</button>
        </div>
      </form>

      <section className="space-y-6">
        <form onSubmit={addSkill} className="dark-panel rounded-2xl p-6 text-white shadow-soft">
          <div className="relative z-10">
          <p className="eyebrow text-mango">Skills</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold">Add teach or learn skills</h2>
          <p className="mt-2 text-white/65">Use the same skill names your classmates may search for, like React, UI Design, Python, or Excel.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Skill name"
              className="field"
              value={skillForm.skillName}
              onChange={(event) => setSkillForm({ ...skillForm, skillName: event.target.value })}
            />
            <select
              className="field"
              value={skillForm.type}
              onChange={(event) => setSkillForm({ ...skillForm, type: event.target.value })}
            >
              <option value="teach">I can teach this</option>
              <option value="learn">I want to learn this</option>
            </select>
            <select
              className="field"
              value={skillForm.level}
              onChange={(event) => setSkillForm({ ...skillForm, level: event.target.value })}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <input
              placeholder="Short description"
              className="field"
              value={skillForm.description}
              onChange={(event) => setSkillForm({ ...skillForm, description: event.target.value })}
            />
          </div>
          <button className="btn-accent mt-4">Add skill</button>
          </div>
        </form>

        {notice && <p className="rounded-xl bg-teal-50 px-4 py-3 font-bold text-lagoon">{notice}</p>}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="orbital-card rounded-2xl border border-teal-100 bg-teal-50/90 p-5 shadow-soft">
            <h3 className="font-display text-2xl font-extrabold">Skills Offered</h3>
            <div className="mt-4 space-y-3">
              {teachSkills.map((skill) => <SkillPill key={skill._id} skill={skill} onDelete={deleteSkill} />)}
            </div>
          </div>
          <div className="orbital-card rounded-2xl border border-amber-100 bg-amber-50/90 p-5 shadow-soft">
            <h3 className="font-display text-2xl font-extrabold">Skills Wanted</h3>
            <div className="mt-4 space-y-3">
              {learnSkills.map((skill) => <SkillPill key={skill._id} skill={skill} onDelete={deleteSkill} />)}
            </div>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

export default ProfilePage;
