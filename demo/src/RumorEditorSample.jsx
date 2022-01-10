import React, { useRef } from 'react';
// import RumorEditor from '@shjeon0730/rumor-editor';
import RumorEditor from './RumorEditor';

const RumorEditorSample = () => {
	const editorRef = useRef(null);
	const onFocusClick = () => {
		editorRef.current?.focus();
	};
	const onBlurClick = () => {
		editorRef.current?.blur();
	};
	const onClearClick = () => {
		editorRef.current?.clear();
	};
	const onEditorClick = () => {
		console.log('editor clicked');
	};
	const onBlockSelected = () => {
		console.log('block selected');
	};
	const onEditorFocused = e => {
		console.log('editor focused:', e);
	};
	const onEditorBlurred = e => {
		console.log('editor blurred:', e);
	};
	return (
		<div>
			<div onClick={onFocusClick}>focus</div>
			<div onClick={onBlurClick}>blur</div>
			<div onClick={onClearClick}>clear</div>
			<RumorEditor
				ref={editorRef}
				onClick={onEditorClick}
				onBlockSelected={onBlockSelected}
				onFocus={onEditorFocused}
				onBlur={onEditorBlurred}
			/>
		</div>
	);
};

export default RumorEditorSample;
