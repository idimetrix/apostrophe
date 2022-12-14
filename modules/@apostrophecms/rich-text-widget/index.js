// Implements rich text editor widgets. Unlike most widget types, the rich text
// editor does not use a modal; instead you edit in context on the page.

const sanitizeHtml = require('sanitize-html');

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    icon: 'format-text-icon',
    label: 'apostrophe:richText',
    contextual: true,
    placeholder: true,
    placeholderText: 'apostrophe:richTextPlaceholder',
    defaultData: { content: '' },
    className: false,
    linkWithType: [ '@apostrophecms/any-page-type' ],
    // For permalinks
    project: {
      title: 1,
      _url: 1
    },
    minimumDefaultOptions: {
      toolbar: [
        'styles',
        'bold',
        'italic',
        'strike',
        'link',
        'bulletList',
        'orderedList',
        'blockquote'
      ],
      styles: [
        // you may also use a `class` property with these
        {
          tag: 'p',
          label: 'apostrophe:richTextParagraph'
        },
        {
          tag: 'h2',
          label: 'apostrophe:richTextH2'
        },
        {
          tag: 'h3',
          label: 'apostrophe:richTextH3'
        },
        {
          tag: 'h4',
          label: 'apostrophe:richTextH4'
        }
      ]
    },
    defaultOptions: {},
    components: {
      widgetEditor: 'AposRichTextWidgetEditor'
    },
    editorTools: {
      styles: {
        component: 'AposTiptapStyles',
        label: 'apostrophe:richTextStyles'
      },
      '|': { component: 'AposTiptapDivider' },
      bold: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextBold',
        icon: 'format-bold-icon',
        command: 'toggleBold'
      },
      italic: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextItalic',
        icon: 'format-italic-icon',
        command: 'toggleItalic'
      },
      underline: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextUnderline',
        icon: 'format-underline-icon',
        command: 'toggleUnderline'
      },
      horizontalRule: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextHorizontalRule',
        icon: 'minus-icon',
        command: 'setHorizontalRule'
      },
      link: {
        component: 'AposTiptapLink',
        label: 'apostrophe:richTextLink',
        icon: 'link-icon'
      },
      bulletList: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextBulletedList',
        icon: 'format-list-bulleted-icon',
        command: 'toggleBulletList'
      },
      orderedList: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextOrderedList',
        icon: 'format-list-numbered-icon',
        command: 'toggleOrderedList'
      },
      strike: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextStrikethrough',
        icon: 'format-strikethrough-variant-icon',
        command: 'toggleStrike'
      },
      blockquote: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextBlockquote',
        icon: 'format-quote-close-icon',
        command: 'toggleBlockquote'
      },
      codeBlock: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextCodeBlock',
        icon: 'code-tags-icon',
        command: 'toggleCode'
      },
      undo: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextUndo',
        icon: 'undo-icon'
      },
      redo: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextRedo',
        icon: 'redo-icon'
      },
      alignLeft: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextAlignLeft',
        icon: 'format-align-left-icon',
        command: 'setTextAlign',
        commandParameters: 'left',
        isActive: { textAlign: 'left' }
      },
      alignCenter: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextAlignCenter',
        icon: 'format-align-center-icon',
        command: 'setTextAlign',
        commandParameters: 'center',
        isActive: { textAlign: 'center' }
      },
      alignRight: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextAlignRight',
        icon: 'format-align-right-icon',
        command: 'setTextAlign',
        commandParameters: 'right',
        isActive: { textAlign: 'right' }
      },
      alignJustify: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextAlignJustify',
        icon: 'format-align-justify-icon',
        command: 'setTextAlign',
        commandParameters: 'justify',
        isActive: { textAlign: 'justify' }
      },
      highlight: {
        component: 'AposTiptapButton',
        label: 'apostrophe:richTextHighlight',
        icon: 'format-color-highlight-icon',
        command: 'toggleHighlight'
      }
    },
    // Additional properties used in executing tiptap commands
    // Will be mixed in automatically for developers
    tiptapTextCommands: {
      setNode: [ 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre' ],
      toggleMark: [
        'b', 'strong', 'code', 'mark', 'em', 'i',
        'a', 's', 'del', 'strike', 'span', 'u'
      ],
      wrapIn: [ 'blockquote' ]
    },
    tiptapTypes: {
      heading: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
      paragraph: [ 'p' ],
      textStyle: [ 'span' ],
      code: [ 'code' ],
      bold: [ 'strong', 'b' ],
      strike: [ 's', 'del', 'strike' ],
      italic: [ 'i', 'em' ],
      highlight: [ 'mark' ],
      link: [ 'a' ],
      underline: [ 'u' ],
      codeBlock: [ 'pre' ],
      blockquote: [ 'blockquote' ]
    }
  },
  beforeSuperClass(self) {
    self.options.defaultOptions = {
      ...self.options.minimumDefaultOptions,
      ...self.options.defaultOptions
    };
  },
  icons: {
    'format-text-icon': 'FormatText',
    'format-color-highlight-icon': 'FormatColorHighlight'
  },
  methods(self) {
    return {
      // Return just the rich text of the widget, which may be undefined or null if it has not yet been edited

      getRichText(widget) {
        return widget.content;
      },

      // Handle permalinks
      async load(req, widgets) {
        const widgetsByDocId = new Map();
        let ids = [];
        const project = self.options.project || {
          title: 1,
          _url: 1
        };
        for (const widget of widgets) {
          if (!widget.permalinkIds) {
            return;
          }
          for (const id of widget.permalinkIds) {
            const docWidgets = widgetsByDocId.get(id) || [];
            docWidgets.push(widget);
            widgetsByDocId.set(id, docWidgets);
          }
        }
        ids = [ ...new Map(ids) ];
        if (!ids.length) {
          return;
        }
        const docs = await self.apos.doc.find(req, {
          _id: {
            $in: ids
          }
        }).project(project).toArray();
        for (const doc of docs) {
          const widgets = widgetsByDocId.get(doc._id) || [];
          for (const widget of widgets) {
            widget._permalinkDocs = widget._permalinkDocs || [];
            widget._permalinkDocs.push(doc);
          }
        }
      },

      // Convert area rich text options into a valid sanitize-html
      // configuration, so that h4 can be legal in one area and illegal in
      // another.

      optionsToSanitizeHtml(options) {
        return {
          ...sanitizeHtml.defaults,
          allowedTags: self.toolbarToAllowedTags(options),
          allowedAttributes: self.toolbarToAllowedAttributes(options),
          allowedClasses: self.toolbarToAllowedClasses(options),
          allowedStyles: self.toolbarToAllowedStyles(options)
        };
      },

      toolbarToAllowedTags(options) {
        const allowedTags = {
          br: true,
          p: true
        };
        const simple = {
          bold: [
            'b',
            'strong'
          ],
          italic: [
            'i',
            'em'
          ],
          strike: [ 's' ],
          link: [ 'a' ],
          horizontalRule: [ 'hr' ],
          bulletList: [
            'ul',
            'li'
          ],
          orderedList: [
            'ol',
            'li'
          ],
          blockquote: [ 'blockquote' ],
          codeBlock: [
            'pre',
            'code'
          ],
          underline: [ 'u' ]
        };
        for (const item of options.toolbar || []) {
          if (simple[item]) {
            for (const tag of simple[item]) {
              allowedTags[tag] = true;
            }
          } else if (item === 'styles') {
            for (const style of options.styles || []) {
              const tag = style.tag;
              allowedTags[tag] = true;
            }
          }
        }
        return Object.keys(allowedTags);
      },

      toolbarToAllowedAttributes(options) {
        const allowedAttributes = {};
        const simple = {
          link: {
            tag: 'a',
            attributes: [
              'href',
              'id',
              'name',
              'target'
            ]
          },
          alignLeft: {
            tag: '*',
            attributes: [ 'style' ]
          },
          alignCenter: {
            tag: '*',
            attributes: [ 'style' ]
          },
          alignRight: {
            tag: '*',
            attributes: [ 'style' ]
          },
          alignJustify: {
            tag: '*',
            attributes: [ 'style' ]
          }
        };
        for (const item of options.toolbar || []) {
          if (simple[item]) {
            for (const attribute of simple[item].attributes) {
              allowedAttributes[simple[item].tag] = allowedAttributes[simple[item].tag] || [];
              allowedAttributes[simple[item].tag].push(attribute);
              allowedAttributes[simple[item].tag] = [ ...new Set(allowedAttributes[simple[item].tag]) ];
            }
          }
        }
        return allowedAttributes;
      },

      toolbarToAllowedStyles(options) {
        const allowedStyles = {};
        const simple = {
          alignLeft: {
            selector: '*',
            properties: {
              'text-align': [ /^left$/ ]
            }
          },
          alignCenter: {
            selector: '*',
            properties: {
              'text-align': [ /^center$/ ]
            }
          },
          alignRight: {
            selector: '*',
            properties: {
              'text-align': [ /^right$/ ]
            }
          },
          alignJustify: {
            selector: '*',
            properties: {
              'text-align': [ /^justify$/ ]
            }
          }
        };
        for (const item of options.toolbar || []) {
          if (simple[item]) {
            if (!allowedStyles[simple[item].selector]) {
              allowedStyles[simple[item].selector] = {};
            }
            for (const property in simple[item].properties) {
              if (!allowedStyles[simple[item].selector][property]) {
                allowedStyles[simple[item].selector][property] = [];
              }

              allowedStyles[simple[item].selector][property]
                .push(...simple[item].properties[property]);
            }
          }
        }

        return allowedStyles;
      },

      toolbarToAllowedClasses(options) {
        const allowedClasses = {};
        if ((options.toolbar || []).includes('styles')) {
          for (const style of options.styles || []) {
            const tag = style.tag;
            const classes = self.getStyleClasses(style);
            allowedClasses[tag] = allowedClasses[tag] || {};
            for (const c of classes) {
              allowedClasses[tag][c] = true;
            }
          }
        }
        for (const tag of Object.keys(allowedClasses)) {
          allowedClasses[tag] = Object.keys(allowedClasses[tag]);
        }
        return allowedClasses;
      },

      getStyleClasses(heading) {
        if (!heading.class) {
          return [];
        }
        return heading.class.split(/\s+/);
      },

      addSearchTexts(item, texts) {
        texts.push({
          weight: 10,
          text: self.apos.util.htmlToPlaintext(item.content),
          silent: false
        });
      },

      isEmpty(widget) {
        const text = self.apos.util.htmlToPlaintext(widget.content || '');
        return !text.trim().length;
      }
    };
  },
  extendMethods(self) {
    return {
      async sanitize(_super, req, input, options) {
        const rteOptions = {
          ...self.options.defaultOptions,
          ...options
        };

        const output = await _super(req, input, rteOptions);
        const finalOptions = self.optionsToSanitizeHtml(rteOptions);

        output.content = sanitizeHtml(input.content, finalOptions);

        const anchors = output.content.match(/"#apostrophe-permalink-[^"?]*?\?/g);
        output.permalinkIds = anchors.map(anchor => {
          const matches = anchor.match(/apostrophe-permalink-(.*)\?/);
          return matches[1];
        });

        return output;
      },
      async output(_super, req, widget, options, _with) {
        let i;
        let content = widget.content || '';
        // "Why no regexps?" We need to do this as quickly as we can.
        // indexOf and lastIndexOf are much faster.
        for (const doc of (widget._permalinkDocs || [])) {
          let offset = 0;
          while (true) {
            i = content.indexOf('apostrophe-permalink-' + doc._id, offset);
            if (i === -1) {
              break;
            }
            offset = i + ('apostrophe-permalink-' + doc._id).length;
            let updateTitle = content.indexOf('?updateTitle=1', i);
            if (updateTitle === i + ('apostrophe-permalink-' + doc._id).length) {
              updateTitle = true;
            } else {
              updateTitle = false;
            }
            // If you can edit the widget, you don't want the link replaced,
            // as that would lose the permalink if you edit the widget
            const left = content.lastIndexOf('<', i);
            const href = content.indexOf(' href="', left);
            const close = content.indexOf('"', href + 7);
            if (!widget._edit) {
              if ((left !== -1) && (href !== -1) && (close !== -1)) {
                content = content.substr(0, href + 6) + doc._url + content.substr(close + 1);
              } else {
                // So we don't get stuck in an infinite loop
                break;
              }
            }
            if (!updateTitle) {
              continue;
            }
            const right = content.indexOf('>', left);
            const nextLeft = content.indexOf('<', right);
            if ((right !== -1) && (nextLeft !== -1)) {
              content = content.substr(0, right + 1) + self.apos.util.escapeHtml(doc.title) + content.substr(nextLeft);
            }
          }
        }
        // We never modify the original widget.content because we do not want
        // it to lose its permalinks in the database
        const _widget = {
          ...widget,
          content
        };
        return _super(req, _widget, options, _with);
      },
      // Add on the core default options to use, if needed.
      getBrowserData(_super, req) {
        const initialData = _super(req);

        const finalData = {
          ...initialData,
          tools: self.options.editorTools,
          defaultOptions: self.options.defaultOptions,
          tiptapTextCommands: self.options.tiptapTextCommands,
          tiptapTypes: self.options.tiptapTypes,
          placeholderText: self.options.placeholder && self.options.placeholderText,
          linkWithType: Array.isArray(self.options.linkWithType) ? self.options.linkWithType : [ self.options.linkWithType ]
        };
        return finalData;
      }
    };
  }
};
