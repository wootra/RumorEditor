import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useReducer,
	useRef,
	useState,
} from 'react';
import PropTypes from 'prop-types';
import classes from './RumorEditor.module.css';
import { EDITOR_ITEM_TYPES } from './EditorItemType';
import Q from 'q';

const createElement = (type, props, children = []) => {
	console.trace('createElement:', type, props, children);
	return { type, props, children };
};

const renderVisibleContent = (
	idx,
	{ type, parent = 'root', props, children = [] }
) => {
	console.trace('render this type:', type, children);
	const key = parent + '_' + idx;
	const myChildren =
		typeof children === 'string'
			? children
			: children.map((child, ci) => {
					console.log('child is', child);
					return renderVisibleContent(ci, { ...child, parent: key });
			  });

	return React.createElement(
		type,
		{
			...props,
			key,
		},
		myChildren
	);
};

const initStates = editorId => ({
	editorId,
	text: '',
	focused: false,
	selectedIndex: [-1, -1],
	lines: [],
	selectedType: EDITOR_ITEM_TYPES.P,
});

const rumorReducer = (state, { type, payload }) => {
	switch (type) {
		case 'reset':
			return {
				...initStates(),
				editorId: state.editorId,
			};
		case 'set':
			return {
				...state,
				...payload,
			};
		default:
			return state;
	}
};

// eslint-disable-next-line react/display-name
const RumorEditor = forwardRef((props, ref) => {
	const { editorId } = props;
	const { onClick: onEditorClick, onFocus, onBlur, onBlockSelected } = props;
	const [state, setStateAll] = useReducer(rumorReducer, editorId, initStates);
	const setAction = useCallback(
		payloadOrg => {
			let payload = payloadOrg === 'function' ? payloadOrg(state) : payloadOrg;
			return new Promise((res, rej) => {
				new Promise(res1 => {
					setStateAll({ type: 'set', payload });
					res1({});
				}).then(() => {
					res(state);
				});
			});
		},
		[state, setStateAll]
	);
	const resetState = useCallback(() => {
		setStateAll({ type: 'reset' });
	}, [setStateAll]);

	const { text, focused, lines, selectedIndex, selectedType } = state;

	// const [text, setText] = useState('');
	// const [focused, setFocused] = useState(false);
	// const [lines, setLines] = useState([]);
	// const [selectedIndex, setSelectedIndex] = useState([-1, -1]); // line index, block index
	const inputRef = useRef(null);

	const onTextChange = e => {
		const text = e.target.value;
		if (selectedIndex[0] >= 0) {
			const currBlock = lines[selectedIndex[0]][selectedIndex[1]];
			const newItem = {
				...currBlock,
				children: text,
			};
			const newLines = lines.map((line, idx) => {
				if (idx === selectedIndex[0]) {
					return line.map((block, bi) =>
						bi === selectedIndex[1] ? newItem : block
					);
				} else {
					return line;
				}
			});
			Q.fcall(() => setAction({ text, lines: newLines }))
				.catch(console.err)
				.done();
		}
	};

	const onTextFocus = () => {
		setAction({ focused: true });
	};

	const onTextBlur = () => {
		setAction({ focused: false });
	};

	const setInitLine = (selType, initText) => {
		const currItem = createElement(selType, {}, initText);
		setAction({ lines: [[currItem]], selectedIndex: [0, 0] });
	};

	useEffect(() => {
		if (focused) onFocus?.(ref);
		else onBlur?.(ref);
	}, [focused, ref, onFocus, onBlur]);

	const onEditorFocused = () => {
		console.log('selected');
		Q.fcall(() => inputRef.current.focus())
			.then(() => {
				if (lines.length === 0) {
					setInitLine(selectedType, '');
				} else {
					const lastLine = lines.length - 1;
					const lastBlock = lines[lastLine].length - 1;
					setAction({ selectedIndex: [lastLine, lastBlock] });
				}
			})
			.then(() => onEditorClick?.(ref))
			.then(() => setAction({ focused: true }))
			.catch(console.error)
			.done();
	};

	useImperativeHandle(
		ref,
		() => ({
			clear: () => {
				Q.fcall(() => setAction({ text: '' }))
					.then(() => setInitLine(selectedType, ''))
					.catch(console.error)
					.done();
			},
			focus: onEditorFocused,
			blur: () => {
				setTimeout(() => {
					inputRef.current?.blur();
				});
				console.log('blur');
			},
		}),
		[]
	);

	const visibleContents = () => {
		return lines.map((line, idx) => {
			console.log('====>', { line });
			console.log('lint-type:', line[0].type, line.line);
			const lineKey = 'line-' + idx;
			return (
				<p key={lineKey}>
					{line.map((block, bi) =>
						renderVisibleContent(bi, { ...block, parent: lineKey })
					)}
				</p>
			);
		});
	};

	const containerClass = `${classes.container} ${
		focused && classes.containerFocused
	}`;
	return (
		<div className={containerClass} onClick={onEditorFocused}>
			<input
				ref={inputRef}
				className={classes.inputBox}
				type='text'
				value={text}
				onFocus={onTextFocus}
				onBlur={onTextBlur}
				onChange={onTextChange}
			/>

			<div className={classes.visibleArea}>{visibleContents()}</div>
		</div>
	);
});

RumorEditor.propTypes = {
	onBlockSelected: PropTypes.func,
	onClick: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func,
	editorId: PropTypes.string,
};

export default RumorEditor;
