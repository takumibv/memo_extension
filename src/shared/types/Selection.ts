// SelectionTarget: discriminated union for future extensibility (text range, etc.)
type ElementSelectionTarget = {
  kind: 'element';
  xpath: string;
};

type TextSelectionTarget = {
  kind: 'text';
  startXpath: string;
  startOffset: number;
  endXpath: string;
  endOffset: number;
};

export type SelectionTarget = ElementSelectionTarget | TextSelectionTarget;

export type Selection = {
  id: string;
  target: SelectionTarget;
  text: string;
  created_at: string;
};
