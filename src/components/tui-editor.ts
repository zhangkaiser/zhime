import { LitElement, html, css, PropertyValueMap, unsafeCSS } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import Editor, { EditorType, PreviewStyle } from '@toast-ui/editor';

@customElement("tui-editor")
export class TuiEditor extends LitElement {
  constructor() {
    super();
  }
  editor!: Editor;

  @property({}) height = '90vh';
  @property() minheight = '200px';
  @property() initialValue = "";
  @property() previewStyle: PreviewStyle = "vertical";
  @property() previewHighlight = true;
  @property() initialEditType: EditorType = "markdown";

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.editor = new Editor({
      el: this.editorElement,
      height: this.height,
      initialEditType: this.initialEditType,
      previewStyle: this.previewStyle,
      usageStatistics: true
    });
  }

  get editorElement() {
    return document.getElementById("editor")!;
  }

  render() {
    return html`<div><slot></slot></div>`;
  }
}

