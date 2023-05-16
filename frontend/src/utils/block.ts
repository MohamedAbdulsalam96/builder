import useStore from "../store";

class Block implements BlockOptions {
	blockId: string;
	blockName?: string;
	element: string;
	editorStyles: BlockStyleMap;
	children: Array<Block>;
	draggable?: boolean;
	baseStyles: BlockStyleMap;
	mobileStyles: BlockStyleMap;
	tabletStyles: BlockStyleMap;
	attributes: BlockAttributeMap;
	classes: Array<string>;
	resizable?: boolean;
	innerText?: string;
	componentData: ComponentData;
	computedStyles: ProxyHandler<BlockStyleMap>;
	isComponent?: boolean;
	originalElement?: string | undefined;
	constructor(options: BlockOptions) {
		delete options.computedStyles;
		this.element = options.element;
		this.draggable = options.draggable;
		this.innerText = options.innerText;
		this.originalElement = options.originalElement;
		this.blockId = options.blockId || this.generateId();
		this.children = (options.children || []).map((child: BlockOptions) => new Block(child));

		this.baseStyles = options.styles || options.baseStyles || {};
		this.mobileStyles = options.mobileStyles || {};
		this.tabletStyles = options.tabletStyles || {};
		this.editorStyles = options.editorStyles || {};
		this.attributes = options.attributes || {};
		this.blockName = options.blockName;
		delete this.attributes.style;
		this.classes = options.classes || [];
		this.isComponent = options.isComponent;

		this.componentData = {
			name: options.blockName,
			isDynamic: false,
		};

		if (this.isButton()) {
			this.editorStyles.display = "inline-block";
		}

		if (this.isRoot()) {
			this.blockId = "root";
			this.editorStyles = {
				height: "fit-content",
				minHeight: "100%",
				width: "inherit",
				position: "absolute",
				overflow: "hidden",
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
			};
			this.draggable = false;
		}

		this.computedStyles = new Proxy(this.baseStyles, {
			set: (target, prop: string, value) => {
				this.setStyle(prop, value);
				return true;
			},
			get: (target, prop: string) => {
				return this.getStyle(prop);
			}
		})
	}
	isImage() {
		return this.element === "img";
	}
	isButton() {
		return this.element === "button";
	}
	isLink() {
		return this.element === "a";
	}
	isText() {
		return ["span", "h1", "p", "b", "h2", "h3", "h4", "h5", "h6", "a", "label"].includes(this.element);
	}
	isContainer() {
		return ["section", "div"].includes(this.element);
	}
	setStyle(style: string, value: number | string) {
		const store = useStore();
		if (store.builderState.activeBreakpoint === "mobile") {
			this.mobileStyles[style] = value;
			return;
		} else if (store.builderState.activeBreakpoint === "tablet") {
			this.tabletStyles[style] = value;
			return;
		}
		this.baseStyles[style] = value;
	}
	getStyle(style: string) {
		const store = useStore();
		if (store.builderState.activeBreakpoint === "mobile") {
			return this.mobileStyles[style] || this.baseStyles[style];
		} else if (store.builderState.activeBreakpoint === "tablet") {
			return this.tabletStyles[style] || this.baseStyles[style];
		}
		return this.baseStyles[style];
	}
	generateId() {
		return Math.random().toString(36).substr(2, 9);
	}
	getIcon() {
		return this.isRoot() ? 'hash' : this.isText() ? 'type': this.isImage() ? 'image': this.isContainer() ? 'square': this.isLink() ? 'link': 'square';
	}
	isRoot() {
		return this.originalElement === "body";
	}
	getTag() {
		return this.element === 'button' ? 'div' : this.element;
	}
	isDiv() {
		return this.element === 'div';
	}
	getStylesCopy() {
		return {
			styles: Object.assign({}, this.baseStyles),
			mobileStyles: Object.assign({}, this.mobileStyles),
			tabletStyles: Object.assign({}, this.tabletStyles),
		}
	}
	getFontFamily() {
		return this.baseStyles.fontFamily || this.mobileStyles.fontFamily || this.tabletStyles.fontFamily || 'Inter';
	}
}

export default Block;
