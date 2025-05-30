import React from 'react';
import styled from '@emotion/styled';
import { IoMdSend } from 'react-icons/io';

export interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  onBlur,
  disabled = false
}) => {
  return (
    <Container>
      <Input
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        onBlur={onBlur}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <SendButton onClick={onSend} disabled={!value.trim() || disabled}>
        <IoMdSend size={20} aria-hidden="true" />
      </SendButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
  background: white;
`;

const Input = styled.input<{ disabled?: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #007AFF;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled ? '#ccc' : '#007AFF'};
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`; 