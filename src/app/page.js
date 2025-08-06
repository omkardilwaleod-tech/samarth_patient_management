
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="container mt-5">
      <div className="text-center mb-5">
        <h1 className="display-4">Welcome to Patient Management App</h1>
        <p className="lead">Please select your role to continue:</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-4 mb-4">
          <Link href="/reception" className="card text-center p-4 shadow-sm h-100 d-flex flex-column justify-content-center">
            <h2 className="card-title">Reception</h2>
            <p className="card-text">Manage patient appointments and check-ins.</p>
          </Link>
        </div>

        <div className="col-md-4 mb-4">
          <Link href="/doctor" className="card text-center p-4 shadow-sm h-100 d-flex flex-column justify-content-center">
            <h2 className="card-title">Doctor</h2>
            <p className="card-text">View patient records and manage treatments.</p>
          </Link>
        </div>

        <div className="col-md-4 mb-4">
          <Link href="/owner" className="card text-center p-4 shadow-sm h-100 d-flex flex-column justify-content-center">
            <h2 className="card-title">Owner</h2>
            <p className="card-text">Oversee clinic operations and reports.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
