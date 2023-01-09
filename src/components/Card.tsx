import React from "react";
import { Card as CardBase, StrictCardProps, CardGroup, CardContent, CardDescription, CardHeader, CardMeta } from "semantic-ui-react";
import { classJoin } from "../utils";
import './Card.scss';

interface CardSpecificProps extends StrictCardProps {
  active?: boolean;
  disabled?: boolean;
}

export default function Card({ className, active, disabled, ...rest }: CardSpecificProps) {
  return <CardBase className={classJoin(className, active && "active", disabled && "disabled")} {...rest} />;
}

Card.Content = CardContent;
Card.Description = CardDescription;
Card.Group = CardGroup;
Card.Header = CardHeader;
Card.Meta = CardMeta;