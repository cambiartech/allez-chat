import React from 'react';
import styled from '@emotion/styled';
import { IoMdSend } from 'react-icons/io';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  onBlur
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
      />
      <SendButton onClick={onSend} disabled={!value.trim()}>
        <IoMdSend size={20} />
      </SendButton>
    </Container>
  );
};

const Container = styled.div`
  padding: 15px;
  background-color: white;
  border-top: 1px solid #E9ECEF;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #E9ECEF;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #f05a29;
  }
`;

const SendButton = styled.button<{ disabled: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.disabled ? '#E9ECEF' : '#f05a29'};
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
`; 