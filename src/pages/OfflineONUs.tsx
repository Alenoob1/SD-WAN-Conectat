import React from "react";
import { Table, Button } from "react-bootstrap";

const OfflineONUs: React.FC = () => {
  // 🔹 Aquí pondrás los datos, igual que hiciste con UnconfiguredONUs
  const onus = [
    {
      id: 1,
      name: "Cristian Jeobany serech",
      sn: "GPON0023409D",
      onu: "COMALAPA gpon-onu_1/2/1:10",
      signal: "OK",
      vlan: 120,
      type: "CGG-F784CW",
      status: "PowerFail",
      authDate: "01-10-2025"
    },
    {
      id: 2,
      name: "Saqueo espana cutzal",
      sn: "GPON00210CC8",
      onu: "POAQUIL gpon-onu_1/4/7:1",
      signal: "LoS",
      vlan: 100,
      type: "CGG-F784CW",
      status: "Offline",
      authDate: "05-09-2025"
    },
  ];

  return (
    <div className="container mt-4">
      <h2>Offline ONUs</h2>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>SN / MAC</th>
            <th>ONU</th>
            <th>Signal</th>
            <th>VLAN</th>
            <th>Type</th>
            <th>Status</th>
            <th>Auth Date</th>
          </tr>
        </thead>
        <tbody>
          {onus.map((onu) => (
            <tr key={onu.id}>
              <td>{onu.name}</td>
              <td>{onu.sn}</td>
              <td>{onu.onu}</td>
              <td>{onu.signal}</td>
              <td>{onu.vlan}</td>
              <td>{onu.type}</td>
              <td>
                <Button variant="secondary" size="sm">
                  {onu.status}
                </Button>
              </td>
              <td>{onu.authDate}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default OfflineONUs;
