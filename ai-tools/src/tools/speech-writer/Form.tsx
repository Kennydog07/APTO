import { useState } from 'react';
import {
  EULOGY_TONE_LABELS,
  SPEECH_LIMITS,
  SPEECH_MINUTES,
  SPEECH_TONES,
  SPEECH_TYPES,
  speechWriterSchema,
  type SpeechTone,
  type SpeechType,
} from '../../../shared/schemas/speech-writer';
import { TOOLS, formatPrice } from '../../../shared/tools';
import {
  BackShortly,
  Button,
  Notice,
  RadioGroup,
  TextArea,
  TextField,
  useAcceptingOrders,
} from '../../components/ui';
import { CheckoutSmallPrint, issuesToFieldErrors } from '../../components/ToolLanding';
import { useCheckout } from '../useCheckout';

const tool = TOOLS['speech-writer'];

export function SpeechWriterForm() {
  const accepting = useAcceptingOrders();
  const { submit, busy, error, fieldErrors, setFieldErrors } = useCheckout(tool.id);
  const [speechType, setSpeechType] = useState<SpeechType | ''>('');
  const [speakerName, setSpeakerName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [subjectNames, setSubjectNames] = useState('');
  const [anecdotes, setAnecdotes] = useState(['', '', '', '', '']);
  const [tone, setTone] = useState<SpeechTone | ''>('');
  const [minutes, setMinutes] = useState<'3' | '5' | '8' | ''>('');
  const [avoid, setAvoid] = useState('');
  const fe = (k: string) => fieldErrors[k]?.[0];
  const isEulogy = speechType === 'eulogy';

  if (accepting === false) return <BackShortly />;

  const toneOptions = isEulogy
    ? (Object.keys(EULOGY_TONE_LABELS) as SpeechTone[]).map((k) => ({
        value: k,
        label: EULOGY_TONE_LABELS[k]!,
      }))
    : (Object.keys(SPEECH_TONES) as SpeechTone[]).map((k) => ({
        value: k,
        label: SPEECH_TONES[k],
      }));

  return (
    <form
      noValidate
      className="space-y-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = speechWriterSchema.safeParse({
          speechType,
          speakerName,
          relationship,
          subjectNames,
          anecdotes,
          tone,
          minutes: minutes ? Number(minutes) : undefined,
          avoid,
        });
        if (!parsed.success) return setFieldErrors(issuesToFieldErrors(parsed.error.issues));
        void submit(parsed.data);
      }}
    >
      <RadioGroup
        legend="What kind of speech?"
        value={speechType}
        error={fe('speechType')}
        onChange={(v) => {
          setSpeechType(v);
          // Eulogies default to heartfelt and can't be "funny".
          if (v === 'eulogy' && (tone === '' || tone === 'funny')) setTone('heartfelt');
        }}
        options={(Object.keys(SPEECH_TYPES) as SpeechType[]).map((k) => ({
          value: k,
          label: SPEECH_TYPES[k],
        }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Your name"
          autoComplete="given-name"
          value={speakerName}
          onChange={setSpeakerName}
          maxLength={SPEECH_LIMITS.speakerName}
          error={fe('speakerName')}
        />
        <TextField
          label="Your relationship"
          hint="e.g. best friend since school, his sister"
          value={relationship}
          onChange={setRelationship}
          maxLength={SPEECH_LIMITS.relationship}
          error={fe('relationship')}
        />
      </div>
      <TextField
        label={isEulogy ? 'Name of the person you’re remembering' : 'Who is the speech about?'}
        hint={isEulogy ? undefined : 'e.g. Sam and Priya, or the retiring colleague’s name'}
        value={subjectNames}
        onChange={setSubjectNames}
        maxLength={SPEECH_LIMITS.subjectNames}
        error={fe('subjectNames')}
      />
      <fieldset className="space-y-3">
        <legend className="font-medium text-stone-800">Stories and facts (2 to 5)</legend>
        <p className="text-sm text-stone-600">
          These are the heart of the speech. We only use what you write here. We never invent
          stories about real people.
        </p>
        {anecdotes.map((a, i) => (
          <TextArea
            key={i}
            label={i < 2 ? `Story or fact ${i + 1}` : `Story or fact ${i + 1} (optional)`}
            required={i < 2}
            rows={3}
            value={a}
            maxLength={SPEECH_LIMITS.anecdote}
            onChange={(v) => setAnecdotes((arr) => arr.map((x, j) => (j === i ? v : x)))}
          />
        ))}
        {fe('anecdotes') && <p className="text-sm font-medium text-red-700">{fe('anecdotes')}</p>}
      </fieldset>
      <RadioGroup
        legend="Tone"
        value={tone}
        onChange={setTone}
        error={fe('tone')}
        options={toneOptions}
      />
      <RadioGroup
        legend="Length"
        value={minutes}
        onChange={setMinutes}
        error={fe('minutes')}
        options={SPEECH_MINUTES.map((m) => ({
          value: String(m) as '3' | '5' | '8',
          label: `${m} minutes`,
          hint: `about ${m * 130} words`,
        }))}
      />
      <TextArea
        label="Anything to avoid? (optional)"
        hint="Topics, names or jokes to leave out."
        required={false}
        rows={2}
        value={avoid}
        onChange={setAvoid}
        maxLength={SPEECH_LIMITS.avoid}
        error={fe('avoid')}
      />

      {Object.keys(fieldErrors).length > 0 && (
        <Notice tone="error">Please fix the highlighted fields.</Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      <Button type="submit" busy={busy} className="w-full sm:w-auto">
        {busy
          ? 'Taking you to secure checkout…'
          : `Continue to payment – ${formatPrice(tool.pricePence)}`}
      </Button>
      <CheckoutSmallPrint what="speech" />
    </form>
  );
}
