// The commands of the `:` command line and how typed text matches them
// (specs/0006-keyboard-navigation, "Command line"). No DOM access, so it's
// unit tested in tests/commands.test.mjs; components/CommandLine runs them.
// Erasable TypeScript only, so Node can run it without a build step.
//
// Most commands take one argument, e.g. `theme dark`; `blog` takes none.
// Names and values are what's typed, English in every language, like vim's
// commands. Usage strings
// follow vim's help notation (:help notation): {} for a required argument,
// | between alternatives; not <>, which vim uses for keys (<Esc>).

export type CommandName = 'status' | 'blog' | 'lang' | 'theme' | 'vim';

export type Status = { code: number; message: string };

// A row in the list
export type Entry =
  // a command before its argument is typed, e.g. `theme {dark|light}`;
  // completes to "theme "
  | { kind: 'hint'; command: CommandName; usage: string; descriptionKey: string }
  // a command with one of its values, e.g. `theme dark`, or a command that
  // takes no argument (`blog`, value ''); runs it. The description is a
  // locales key, or the text itself for a status (its name)
  | {
      kind: 'option';
      command: CommandName;
      value: string;
      name: string;
      descriptionKey?: string;
      description?: string;
    };

export type MatchResult = {
  entries: Entry[];
  // when nothing matches: the locales key of the vim-style error, and what
  // it's about
  error: {
    key: 'COMMAND_NOT_FOUND' | 'COMMAND_INVALID_ARGUMENT' | 'COMMAND_TRAILING_CHARACTERS';
    text: string;
  } | null;
};

type Value = { value: string; descriptionKey?: string; description?: string };

type Command = {
  name: CommandName;
  descriptionKey: string;
  // the argument, for the commands that take one
  usage?: string;
  values?: (statuses: Status[]) => Value[];
};

// in the order they're listed: going somewhere first, then the settings
export const COMMANDS: Command[] = [
  {
    name: 'status',
    usage: '{code}',
    descriptionKey: 'COMMAND_STATUS',
    values: (statuses) =>
      statuses.map(({ code, message }) => ({ value: String(code), description: message })),
  },
  { name: 'blog', descriptionKey: 'COMMAND_BLOG' },
  {
    name: 'lang',
    usage: '{eng|cat}',
    descriptionKey: 'COMMAND_LANG',
    // ISO 639-2 codes; each language's name is written in that language
    values: () => [
      { value: 'eng', descriptionKey: 'COMMAND_LANG_ENG' },
      { value: 'cat', descriptionKey: 'COMMAND_LANG_CAT' },
    ],
  },
  {
    name: 'theme',
    usage: '{dark|light}',
    descriptionKey: 'COMMAND_THEME',
    values: () => [
      { value: 'dark', descriptionKey: 'COMMAND_THEME_DARK' },
      { value: 'light', descriptionKey: 'COMMAND_THEME_LIGHT' },
    ],
  },
  {
    name: 'vim',
    usage: '{on|off}',
    descriptionKey: 'COMMAND_VIM',
    values: () => [
      { value: 'on', descriptionKey: 'COMMAND_VIM_ON' },
      { value: 'off', descriptionKey: 'COMMAND_VIM_OFF' },
    ],
  },
];

// the row for a command before its argument: a hint for the commands that
// take one, the command itself (ready to run) for those that don't
const commandRow = (command: Command): Entry =>
  command.values
    ? {
        kind: 'hint',
        command: command.name,
        usage: command.usage ?? '',
        descriptionKey: command.descriptionKey,
      }
    : {
        kind: 'option',
        command: command.name,
        value: '',
        name: command.name,
        descriptionKey: command.descriptionKey,
      };

// Like vim's command-line completion, what's typed must be the start of a
// command (`th` finds theme, `dark` finds nothing), ignoring case and
// repeated spaces; an empty input lists every command. Once a command's full
// name and a space are typed, the list is its values starting with the
// argument (`theme d` → theme dark, `status 4` → the 4xx statuses, `status `
// → every status).
export function matchCommands(input: string, statuses: Status[]): MatchResult {
  const typed = input.trimStart().replace(/\s+/g, ' ').toLowerCase();
  const [, name, rest] = typed.match(/^(\S+) (.*)$/) ?? [];
  const command = COMMANDS.find((c) => c.name === name);

  if (command) {
    const argument = rest.trim();
    if (!command.values) {
      // `blog x`: vim's error for an argument a command doesn't take
      return argument
        ? { entries: [], error: { key: 'COMMAND_TRAILING_CHARACTERS', text: argument } }
        : { entries: [commandRow(command)], error: null };
    }
    const entries: Entry[] = command
      .values(statuses)
      .filter(({ value }) => value.startsWith(argument))
      .map(({ value, descriptionKey, description }) => ({
        kind: 'option',
        command: command.name,
        value,
        name: `${command.name} ${value}`,
        descriptionKey,
        description,
      }));
    return {
      entries,
      error: entries.length ? null : { key: 'COMMAND_INVALID_ARGUMENT', text: argument },
    };
  }

  const entries = COMMANDS.filter((c) => c.name.startsWith(typed.trim())).map(commandRow);
  return {
    entries,
    error: entries.length ? null : { key: 'COMMAND_NOT_FOUND', text: input.trim() },
  };
}
