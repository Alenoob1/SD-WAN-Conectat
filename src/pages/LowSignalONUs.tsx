import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";

type ONU = {
  id: number;
  name: string;
  sn: string;
  signal: string;
  status: string;
  zone: string;
};

const LowSignalONUs: React.FC = () => {
  const [onus, setOnus] = useState<ONU[]>([]);

  // Simulación de datos de ONUs con señal baja
  useEffect(() => {
    setOnus([
      {
        id: 1,
        name: "Lizbeth Otzoy Calisio",
        sn: "HWTC0F8225AE",
        signal: "-31.32 dBm",
        status: "Warning",
        zone: "Zone 1",
      },
      {
        id: 2,
        name: "Jorge Luis Otzoy",
        sn: "HWTC0F82E0AE",
        signal: "-31.10 dBm",
        status: "Warning",
        zone: "Zone 1",
      },
      {
        id: 3,
        name: "Edvin Orlando Cali Sotz",
        sn: "ALCLFC680661",
        signal: "-31.20 dBm",
        status: "Critical",
        zone: "Zone 1",
      },
    ]);
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Low Signal ONUs</h2>
      <Table striped bordered hover responsive>
        <thead className="table-warning">
          <tr>
            <th>Name</th>
            <th>SN / MAC</th>
            <th>Signal</th>
            <th>Status</th>
            <th>Zone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {onus.map((onu) => (
            <tr key={onu.id}>
              <td>{onu.name}</td>
              <td>{onu.sn}</td>
              <td>{onu.signal}</td>
              <td>
                <span
                  className={`badge ${
                    onu.status === "Critical" ? "bg-danger" : "bg-warning text-dark"
                  }`}
                >
                  {onu.status}
                </span>
              </td>
              <td>{onu.zone}</td>
              <td>
                <Button variant="info" size="sm">
                  View ONU
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default LowSignalONUs;
