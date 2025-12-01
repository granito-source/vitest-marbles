export function stripAlignmentChars(marbles: string): string {
  return marbles.replace(/^ +/, '');
}
