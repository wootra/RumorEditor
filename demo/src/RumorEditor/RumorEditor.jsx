import React, { forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import classes from './RumorEditor.module.css';
import Q from 'q';
import { useRumorEditor } from './useRumorEditor';
import { renderVisibleContent } from './renderers';
import './articleStyles.css';

// eslint-disable-next-line react/display-name
const RumorEditor = forwardRef((props, ref) => {
	const { editorId } = props;

	const {
		states: { text, focused, lines, selectedIndex, selectedType },
		actions: { setAction, resetState, setInitLine },
		callbacks: { onTextChange, onEditorFocused, onTextBlur, onTextFocus },
		refs: { inputRef },
	} = useRumorEditor(editorId, props, ref);

	useImperativeHandle(
		ref,
		() => ({
			clear: () => {
				Q.fcall(resetState)
					.then(() => setInitLine(selectedType, ''))
					.catch(console.error)
					.done();
			},
			focus: onEditorFocused,
			blur: () => {
				setTimeout(() => {
					inputRef.current?.blur();
				});
			},
		}),
		[resetState, setInitLine, selectedType, onEditorFocused, inputRef]
	);

	const visibleContents = () => {
		return lines.map((line, idx) => {
			const lineKey = 'line-' + idx;
			return (
				<p key={lineKey}>
					{line.map((block, bi) =>
						renderVisibleContent(bi, { ...block, parentKey: lineKey })
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
