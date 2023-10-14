
import { DataGrid } from '@mui/x-data-grid';

function CommonTable({ columns, data }) {
    return (
        <>
            <div style={{ height: 600, width: '100%', marginTop: "30px" }}>
                <DataGrid
                    rows={data}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                />
            </div>
        </>
    );
}

export default CommonTable;
