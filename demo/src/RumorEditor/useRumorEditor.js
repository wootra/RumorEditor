import { useCallback, useEffect, useRef } from 'react';
import { useRumorReducer } from './useRumorReducer';
import Q from 'q';

const createElement = (type, props, children = []) => {
	return { type, props, children };
};

export const useRumorEditor = (editorId, props, ref) => {
	const { onClick: onEditorClick, onFocus, onBlur, onBlockSelected } = props;
	const { state, setStateAll } = useRumorReducer(editorId);
	const { text, focused, lines, selectedIndex, selectedType } = state;

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

	const setInitLine = useCallback(
		(selType, initText) => {
			const currItem = createElement(selType, {}, initText);
			setAction({ lines: [[currItem]], selectedIndex: [0, 0] });
		},
		[setAction]
	);

	const onEditorFocused = useCallback(() => {
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
	}, [setInitLine, setAction, onEditorClick, lines, ref, selectedType]);

	useEffect(() => {
		if (focused) onFocus?.(ref);
		else onBlur?.(ref);
	}, [focused, ref, onFocus, onBlur]);

	return {
		states: { text, focused, lines, selectedIndex, selectedType },
		refs: {
			inputRef,
		},
		actions: {
			setAction,
			resetState,
			setInitLine,
		},

		callbacks: {
			onTextChange,
			onEditorFocused,
			onTextBlur,
			onTextFocus,
		},
	};
};
