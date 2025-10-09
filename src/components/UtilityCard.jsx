import React from 'react';
import { Card, Button } from 'antd';
export default function UtilityCard({title, description, children}) {
  return (
    <Card title={title} style={{marginBottom:12}}>
      <div style={{marginBottom:8,color:'#666'}}>{description}</div>
      <div>{children}</div>
    </Card>
  );
}