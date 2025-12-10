import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
              </div>
        </div>

                      <p className="text-muted">Manage quotations</p>
              <Link to="/quotes" className="btn btn-outline-info btn-sm">
                View Quotes
              </Link>
            </div>
          </div>
        </div>

                    </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;