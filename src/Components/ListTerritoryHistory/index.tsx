import { IListItemsProps } from "./types"

function ListTerritoryHistory({ territoryHistory }: IListItemsProps) {
  return (
    <ul className="flex w-full h-fit flex-wrap justify-center mt-5">
      {territoryHistory?.map(history => (
        <li
          className={`flex flex-col flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100 m-1`}
          key={history.id}
        >
          <div className="flex w-full justify-start items-center p-6 text-primary-200 font-semibold">
            Dirigente
            <span className="font-normal ml-5">{history.caretaker}</span>
          </div>
          <div className="flex flex-wrap justify-between w-full px-6 pb-6 font-semi-bold">
            <div className="w-96">
              <span className="text-primary-200 font-semibold mr-5">Data da designação:</span>
              <span>{history.assignment_date.toString()}</span>
            </div>
            <div className="w-96">
              <span className="text-primary-200 font-semibold mr-5">Data da conclusão:</span>
              {history.completion_date && <span>{history.completion_date.toString()}</span>}
            </div>
            <div className="w-96">
              <span className="text-primary-200 font-semibold mr-5">Tipo de cobertura</span>
              <span>{history.work_type}</span>
            </div>
            <div className="flex mt-4">
              <div className="gap-1 flex items-end">
                {/* <Button
                  className="w-30"
                  onClick={() => Router.push(`/anuncios/edit/${notice.id}`)}
                  outline
                >
                  <EditIcon />
                  Editar
                </Button> */}
                {/* <ConfirmDeleteModal
                  onDelete={() => onDelete(`${notice.id}`)}
                  button={<Button
                    outline
                    className="text-red-400 w-30"
                  >
                    <Trash />
                    Excluir
                  </Button>}
                /> */}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ListTerritoryHistory
